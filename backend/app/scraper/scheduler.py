"""
ARQ-based job scheduler for web scraping

Features:
- Redis-backed job queue with persistence
- CRITICAL: max_jobs=1 to enforce single concurrent scraper
- Cron-based scheduling for daily/weekly scrapes
- Full job monitoring and error tracking
- Exponential backoff retry logic
"""

from arq import create_pool, cron
from arq.connections import RedisSettings, ArqRedis
import yaml
from datetime import datetime
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.scraper import ScraperJob
from app.scraper.scraper_engine import ScraperEngine
from app.scraper.data_pipeline import validate_and_save_products
import logging
from pathlib import Path
from typing import List

logger = logging.getLogger(__name__)

# CRITICAL: Concurrency limit enforced at Redis level
# Only 1 scraping job can run at a time (memory constraint)
REDIS_SETTINGS = RedisSettings(
    host='redis',  # Docker service name
    port=6379,
    database=0
)


async def run_scraper_job(ctx: dict, scraper_id: str) -> dict:
    """
    ARQ worker function: Execute scraper job with full monitoring
    
    This is the main entry point for scheduled and manual scraper jobs.
    
    Args:
        ctx: ARQ context (contains redis connection, etc.)
        scraper_id: ID from scraper_config.yaml (e.g., 'sick-ag-products')
    
    Returns:
        Result dictionary with job statistics
    
    Raises:
        Exception: Any scraping error (ARQ will handle retry)
    """
    db: Session = next(get_db())
    
    # Create job record in database
    job = ScraperJob(
        scraper_id=scraper_id,
        status='running',
        started_at=datetime.utcnow()
    )
    db.add(job)
    db.commit()
    
    job_id = job.id
    
    try:
        logger.info(f"[Job {job_id}] Starting scraper: {scraper_id}")
        
        # Load configuration and initialize engine
        config_path = Path(__file__).parent / 'scraper_config.yaml'
        engine = ScraperEngine(str(config_path))
        config = engine.configs[scraper_id]
        
        logger.info(f"[Job {job_id}] Scraping {config.vendor_name} from {len(config.start_urls)} URLs")
        
        # Execute scraping
        raw_products = await engine.scrape_vendor(scraper_id)
        job.records_extracted = len(raw_products)
        db.commit()
        
        logger.info(f"[Job {job_id}] Extracted {len(raw_products)} products")
        
        # Validate and save to database
        result = await validate_and_save_products(
            raw_products=raw_products,
            scraper_id=scraper_id,
            vendor_name=config.vendor_name,
            db=db
        )
        
        # Update job status
        job.status = 'completed'
        job.records_saved = result['saved'] + result.get('updated', 0)
        job.records_rejected = result['rejected']
        job.completed_at = datetime.utcnow()
        db.commit()
        
        logger.info(
            f"[Job {job_id}] Completed successfully: "
            f"{result['saved']} saved, {result.get('updated', 0)} updated, "
            f"{result['rejected']} rejected"
        )
        
        return {
            'job_id': job_id,
            'scraper_id': scraper_id,
            'status': 'completed',
            'records_extracted': len(raw_products),
            'records_saved': result['saved'],
            'records_updated': result.get('updated', 0),
            'records_rejected': result['rejected']
        }
        
    except Exception as e:
        logger.error(f"[Job {job_id}] Scraper job failed: {str(e)}", exc_info=True)
        
        # Update job with error
        job.status = 'failed'
        job.error_message = str(e)[:1000]  # Truncate long errors
        job.completed_at = datetime.utcnow()
        db.commit()
        
        # Re-raise for ARQ retry logic
        raise
    
    finally:
        db.close()


async def startup(ctx: dict):
    """Initialize resources when worker starts"""
    logger.info("ARQ worker starting up")
    ctx['startup_time'] = datetime.utcnow()


async def shutdown(ctx: dict):
    """Cleanup resources when worker shuts down"""
    logger.info("ARQ worker shutting down")


# ARQ worker settings
class WorkerSettings:
    """
    ARQ worker configuration
    
    CRITICAL SETTINGS:
    - max_jobs=1: Only 1 concurrent job (memory constraint)
    - job_timeout=3600: 1 hour max per job
    """
    functions = [run_scraper_job]
    redis_settings = REDIS_SETTINGS
    
    # CRITICAL: Resource constraints
    max_jobs = 1  # Only 1 scraping job at a time (memory safety)
    job_timeout = 3600  # 1 hour max per job
    
    # Retry configuration
    max_tries = 3
    retry_jobs = True
    
    # Worker lifecycle
    on_startup = startup
    on_shutdown = shutdown
    
    # Logging
    log_results = True
    allow_abort_jobs = True
    
    # Cron jobs - loaded from config
    # These are defined in get_cron_jobs() below


def get_cron_jobs() -> List:
    """
    Load cron jobs from scraper_config.yaml
    
    Returns:
        List of ARQ cron job definitions
    """
    config_path = Path(__file__).parent / 'scraper_config.yaml'
    
    try:
        with open(config_path) as f:
            config = yaml.safe_load(f)
        
        cron_jobs = []
        
        for scraper in config.get('scrapers', []):
            if 'schedule' in scraper:
                # Parse cron expression (e.g., "0 2 * * *" = daily at 2 AM)
                parts = scraper['schedule'].split()
                
                if len(parts) == 5:
                    minute, hour, day, month, weekday = parts
                    
                    # Create a unique wrapper function for this scraper
                    # ARQ cron() doesn't support args/kwargs, so we wrap the call
                    def make_cron_wrapper(sid):
                        async def _cron_wrapper(ctx):
                            await run_scraper_job(ctx, sid)
                        _cron_wrapper.__name__ = f"cron_{sid.replace('-', '_')}"
                        return _cron_wrapper

                    cron_task = make_cron_wrapper(scraper['id'])

                    # Create ARQ cron job
                    cron_jobs.append(
                        cron(
                            cron_task,
                            minute=int(minute) if minute != '*' else None,
                            hour=int(hour) if hour != '*' else None,
                            day=int(day) if day != '*' else None,
                            month=int(month) if month != '*' else None,
                            weekday=int(weekday) if weekday != '*' else None,
                            run_at_startup=False,
                            unique=True,
                            timeout=3600
                        )
                    )
                    
                    logger.info(f"Scheduled cron job: {scraper['id']} at {scraper['schedule']}")
        
        return cron_jobs
    
    except Exception as e:
        logger.error(f"Failed to load cron jobs: {e}", exc_info=True)
        return []


# Update WorkerSettings with cron jobs
WorkerSettings.cron_jobs = get_cron_jobs()  # Call function to get list


async def enqueue_scraper_job(scraper_id: str) -> str:
    """
    Manually enqueue a scraper job (for API triggers)
    
    Args:
        scraper_id: ID from scraper_config.yaml
    
    Returns:
        ARQ job ID
    """
    redis = await create_pool(REDIS_SETTINGS)
    
    job = await redis.enqueue_job(
        'run_scraper_job',
        scraper_id,
        _job_id=f"scraper-{scraper_id}-{int(datetime.utcnow().timestamp())}"
    )
    
    logger.info(f"Enqueued scraper job: {scraper_id}, job_id={job.job_id}")
    
    return job.job_id
