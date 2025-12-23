from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.database import get_db
from app.scrapers.sick_scraper import SICKScraper
from app.scrapers.abb_scraper import ABBScraper
from app.scrapers.siemens_scraper import SiemensScraper
from app.scrapers.schneider_scraper import SchneiderScraper
from app.scrapers.murrelektronik_scraper import MurrelektronikScraper

router = APIRouter()

def get_scraper(brand: str, db: Session):
    brand = brand.lower()
    if brand == "sick":
        return SICKScraper(db)
    elif brand == "abb":
        return ABBScraper(db)
    elif brand == "siemens":
        return SiemensScraper(db)
    elif brand == "schneider":
        return SchneiderScraper(db)
    elif brand == "murr":
        return MurrelektronikScraper(db)
    return None

@router.post("/scrape/{brand}")
async def trigger_scrape(brand: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    scraper = get_scraper(brand, db)
    if not scraper:
        raise HTTPException(status_code=404, detail="Scraper not found for this brand")
    
    # Run in background to not block response
    background_tasks.add_task(scraper.scrape_catalog)
    return {"message": f"Scraping started for {brand}", "status": "processing"}

@router.post("/scrape/url")
async def scrape_specific_url(brand: str, url: str, db: Session = Depends(get_db)):
    scraper = get_scraper(brand, db)
    if not scraper:
        raise HTTPException(status_code=404, detail="Scraper not found")
    
    result = await scraper.extract_part_details(url)
    if result:
        await scraper.save_to_database(result)
        return {"message": "Scraped successfully", "data": result}
    
    raise HTTPException(status_code=500, detail="Scraping failed")
