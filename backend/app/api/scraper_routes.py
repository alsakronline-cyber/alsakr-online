from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.scrapers import ScraperManager

router = APIRouter(prefix="/api/admin/scraper", tags=["Scraper"])

@router.post("/start/{brand}")
async def start_scraper(brand: str, db: Session = Depends(get_db)):
    manager = ScraperManager(db)
    scraper = manager.get_scraper(brand)
    if not scraper:
        raise HTTPException(status_code=404, detail=f"Scraper for {brand} not found")
    
    # In production, this should run as a background task (Celery/Redis)
    # For MVP, we run it directly (blocking) or using BackgroundTasks
    await scraper.scrape_catalog()
    return {"status": "started", "brand": brand}

@router.get("/status")
def get_scraper_status():
    return {"status": "idle", "active_jobs": []}

@router.post("/stop")
def stop_scraper():
    return {"status": "stopped"}
