"""
REST API routes for scraper management

Endpoints:
- POST /api/scraper/jobs/trigger/{scraper_id} - Manually trigger scraper
- GET /api/scraper/jobs - List recent jobs
- GET /api/scraper/jobs/{job_id} - Get job status
- GET /api/scraper/products/{vendor_name} - List scraped products
- GET /api/scraper/stats - Get scraper statistics
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.scraper import ScraperJob, ScrapedProduct
from app.scraper.scheduler import enqueue_scraper_job
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/api/scraper", tags=["scraper"])


# Response models
class JobResponse(BaseModel):
    id: int
    scraper_id: str
    status: str
    records_extracted: int
    records_saved: int
    records_rejected: int
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    error_message: Optional[str]
    
    class Config:
        from_attributes = True


class ProductResponse(BaseModel):
    id: int
    vendor_name: str
    part_number: str
    product_name: str
    category: Optional[str]
    description: Optional[str]
    specifications: Optional[dict]
    image_urls: Optional[List[str]]
    pdf_urls: Optional[List[str]]
    source_url: Optional[str]
    scraped_at: datetime
    
    class Config:
        from_attributes = True


@router.post("/jobs/trigger/{scraper_id}")
async def trigger_scraper_job(
    scraper_id: str,
    db: Session = Depends(get_db)
):
    """
    Manually trigger a scraper job
    
    Adds job to ARQ queue for immediate execution.
    Job will run based on max_jobs constraint (sequential execution).
    
    Args:
        scraper_id: ID from scraper_config.yaml (e.g., 'sick-ag-products')
    
    Returns:
        Job trigger confirmation with ARQ job ID
    """
    try:
        arq_job_id = await enqueue_scraper_job(scraper_id)
        
        return {
            "message": f"Scraper '{scraper_id}' triggered successfully",
            "scraper_id": scraper_id,
            "arq_job_id": arq_job_id,
            "status": "queued"
        }
    
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to trigger scraper: {str(e)}")


@router.get("/jobs", response_model=List[JobResponse])
async def list_scraper_jobs(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    status: Optional[str] = None,
    scraper_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    List recent scraper jobs with optional filters
    
    Args:
        limit: Maximum number of jobs to return (1-200)
        offset: Number of jobs to skip
        status: Filter by status (queued, running, completed, failed)
        scraper_id: Filter by scraper ID
    
    Returns:
        List of job records
    """
    query = db.query(ScraperJob)
    
    if status:
        query = query.filter(ScraperJob.status == status)
    
    if scraper_id:
        query = query.filter(ScraperJob.scraper_id == scraper_id)
    
    jobs = query.order_by(ScraperJob.created_at.desc())\
        .offset(offset)\
        .limit(limit)\
        .all()
    
    return jobs


@router.get("/jobs/{job_id}", response_model=JobResponse)
async def get_job_status(
    job_id: int,
    db: Session = Depends(get_db)
):
    """
    Get detailed status of specific scraper job
    
    Args:
        job_id: Database ID of the job
    
    Returns:
        Job details including status, counts, timing, errors
    """
    job = db.query(ScraperJob).filter(ScraperJob.id == job_id).first()
    
    if not job:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
    
    return job


@router.get("/products/{vendor_name}", response_model=List[ProductResponse])
async def get_vendor_products(
    vendor_name: str,
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Retrieve scraped products for a vendor
    
    Args:
        vendor_name: Name of the vendor (e.g., 'SICK AG')
        limit: Maximum products to return (1-500)
        offset: Number of products to skip
        category: Filter by product category
        search: Search in product name or part number
    
    Returns:
        List of products with full details
    """
    query = db.query(ScrapedProduct).filter(
        ScrapedProduct.vendor_name == vendor_name
    )
    
    if category:
        query = query.filter(ScrapedProduct.category == category)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (ScrapedProduct.product_name.ilike(search_term)) |
            (ScrapedProduct.part_number.ilike(search_term))
        )
    
    products = query.order_by(ScrapedProduct.scraped_at.desc())\
        .offset(offset)\
        .limit(limit)\
        .all()
    
    return products


@router.get("/stats")
async def get_scraper_stats(db: Session = Depends(get_db)):
    """
    Get overall scraper statistics
    
    Returns:
        Aggregated stats across all scrapers:
        - Total products by vendor
        - Recent job success/failure rates
        - Last successful scrape times
    """
    # Product counts by vendor
    from sqlalchemy import func
    
    vendor_counts = db.query(
        ScrapedProduct.vendor_name,
        func.count(ScrapedProduct.id).label('product_count')
    ).group_by(ScrapedProduct.vendor_name).all()
    
    # Recent job stats (last 30 days)
    from datetime import timedelta
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    
    recent_jobs = db.query(
        ScraperJob.scraper_id,
        ScraperJob.status,
        func.count(ScraperJob.id).label('count')
    ).filter(
        ScraperJob.created_at >= thirty_days_ago
    ).group_by(ScraperJob.scraper_id, ScraperJob.status).all()
    
    # Last successful scrape per scraper
    last_successful = db.query(
        ScraperJob.scraper_id,
        func.max(ScraperJob.completed_at).label('last_success')
    ).filter(
        ScraperJob.status == 'completed'
    ).group_by(ScraperJob.scraper_id).all()
    
    return {
        "products_by_vendor": [
            {"vendor": v.vendor_name, "count": v.product_count}
            for v in vendor_counts
        ],
        "recent_jobs": [
            {"scraper_id": j.scraper_id, "status": j.status, "count": j.count}
            for j in recent_jobs
        ],
        "last_successful_scrapes": [
            {"scraper_id": s.scraper_id, "last_success": s.last_success}
            for s in last_successful
        ]
    }


@router.get("/health")
async def scraper_health_check():
    """
    Health check endpoint for scraper service
    
    Returns:
        Service status and version
    """
    return {
        "status": "healthy",
        "service": "scraper",
        "version": "1.0.0",
        "timestamp": datetime.utcnow()
    }
