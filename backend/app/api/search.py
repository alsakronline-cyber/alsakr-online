from fastapi import APIRouter
from app.ai.search import SearchEngine

router = APIRouter()
search_engine = SearchEngine()

@router.post("/text")
async def search_text(query: str):
    results = await search_engine.search(query, type="text")
    return results

@router.post("/image")
async def search_image():
    # Image logic here
    return {"results": []}
