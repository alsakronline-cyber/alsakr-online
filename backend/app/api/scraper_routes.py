from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.scrapers import ScraperManager

router = APIRouter(prefix="/api/admin/scraper", tags=["Scraper"])

from pydantic import BaseModel

class ScrapeRequest(BaseModel):
    brand: str
    url: str


@router.post("/scrape-url")
async def scrape_url(request: ScrapeRequest, db: Session = Depends(get_db)):
    manager = ScraperManager(db)
    scraper = manager.get_scraper(request.brand)
    if not scraper:
        raise HTTPException(status_code=404, detail=f"Scraper for {request.brand} not found")
    
    try:
        # 1. Scrape Data
        data = await scraper.extract_part_details(request.url)
        
        # 2. Save to Database
        from app.models.part import Part
        new_part = Part(
            part_number=data.get("part_number"),
            manufacturer=data.get("manufacturer"),
            description_en=data.get("description_en", "Scraped Part"),
            status="active",
            technical_specs=data
        )
        db.add(new_part)
        db.commit()
        db.refresh(new_part)

        # 3. Generate Embeddings & Index in Qdrant (RAG)
        from app.ai.embeddings import EmbeddingService
        from app.ai.qdrant_client import QdrantManager
        
        embedder = EmbeddingService()
        qdrant = QdrantManager()
        
        # Create a rich description for semantic search
        search_text = f"{new_part.manufacturer} {new_part.part_number} {new_part.description_en}"
        vector = embedder.generate_text_embedding(search_text)
        
        qdrant.upsert_part_embedding(
            part_id=new_part.id,
            vector=vector,
            metadata={
                "name": new_part.part_number,
                "description": new_part.description_en,
                "manufacturer": new_part.manufacturer
            },
            collection_type="text"
        )

        return {
            "status": "success", 
            "message": f"Scraped, saved, and indexed {new_part.part_number}", 
            "part_id": new_part.id,
            "data": data
        }
    except Exception as e:
        db.rollback()
        print(f"Scrape Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

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

@router.post("/reindex")
def reindex_all(db: Session = Depends(get_db)):
    """
    Re-indexes all parts from the database into Qdrant.
    Useful after a backend restart or if the vector index is lost.
    """
    try:
        from app.models.part import Part
        from app.ai.embeddings import EmbeddingService
        from app.ai.qdrant_client import QdrantManager
        
        parts = db.query(Part).all()
        embedder = EmbeddingService()
        qdrant = QdrantManager()
        
        count = 0
        for part in parts:
            search_text = f"{part.manufacturer} {part.part_number} {part.description_en}"
            # Truncate text if too long to avoid token issues, though embedder handles it now
            vector = embedder.generate_text_embedding(search_text)
            
            qdrant.upsert_part_embedding(
                part_id=part.id,
                vector=vector,
                metadata={
                    "name": part.part_number,
                    "description": part.description_en,
                    "manufacturer": part.manufacturer,
                    "image_url": part.technical_specs.get("image_url") if part.technical_specs else None
                },
                collection_type="text"
            )
            count += 1
            
        return {"status": "success", "reindexed_count": count}
    except Exception as e:
        print(f"Reindexing failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
