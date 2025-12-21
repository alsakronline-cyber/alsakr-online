from fastapi import APIRouter

router = APIRouter()

@router.post("/scrapers/{brand}/start")
async def start_scraper(brand: str):
    return {"status": "started", "brand": brand}

@router.post("/scrapers/stop")
async def stop_all_scrapers():
    return {"status": "stopped"}
