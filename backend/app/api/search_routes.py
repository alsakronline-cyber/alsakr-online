from fastapi import APIRouter, UploadFile, File, Depends
from app.models.search import TextSearchRequest, SearchResponse
from app.ai.text_search import TextSearchEngine
from app.ai.vision_agent import VisionAgent
from app.ai.voice_processor import VoiceProcessor
import time

router = APIRouter(prefix="/api/search", tags=["AI Search"])

@router.post("/text", response_model=SearchResponse)
async def search_text(request: TextSearchRequest):
    start_time = time.time()
    engine = TextSearchEngine()
    raw_results = await engine.search_by_description(request.query)
    
    # Transform Qdrant ScoredPoint objects to SearchResult format
    from app.models.search import SearchResult
    formatted_results = [
        SearchResult(
            part_id=str(result.id),
            part_number=result.payload.get("name", "Unknown"),
            manufacturer=result.payload.get("manufacturer", "Generic"),
            description=result.payload.get("description", ""),
            score=result.score,
            thumbnail_url=result.payload.get("image_url")
        )
        for result in raw_results
    ]
    
    return SearchResponse(
        results=formatted_results,
        query_time_ms=(time.time() - start_time) * 1000,
        total_found=len(formatted_results)
    )

@router.post("/image")
async def search_image(file: UploadFile = File(...)):
    import os
    start_time = time.time()
    os.makedirs("data/images", exist_ok=True)
    file_path = f"data/images/{file.filename}"
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    agent = VisionAgent()
    analysis = await agent.identify_part_from_image(file_path)
    
    return {
        "results": analysis["similar_parts"],
        "analysis": analysis["llm_analysis"],
        "ocr_text": analysis["ocr_text"],
        "query_time_ms": (time.time() - start_time) * 1000
    }

@router.post("/voice")
async def search_voice(file: UploadFile = File(...)):
    import os
    os.makedirs("data/audio", exist_ok=True)
    file_path = f"data/audio/{file.filename}"
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    processor = VoiceProcessor()
    transcription = await processor.transcribe_audio(file_path)
    
    # Chain to text search
    engine = TextSearchEngine()
    search_results = await engine.search_by_description(transcription["text"])

    # Mock AI Analysis for now (since we don't have a chat agent yet)
    ai_analysis = f"I heard you say '{transcription['text']}'. Based on that, I found {len(search_results)} relevant parts in our inventory."

    return {
        "text": transcription["text"],
        "results": search_results,
        "analysis": ai_analysis
    }
