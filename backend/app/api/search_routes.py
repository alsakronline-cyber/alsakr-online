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
    results = await engine.search_by_description(request.query)
    
    return SearchResponse(
        results=results,
        query_time_ms=(time.time() - start_time) * 1000,
        total_found=len(results)
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
    
    # Ideally, chain this to text search
    # engine = TextSearchEngine()
    # results = await engine.search_by_description(transcription["text"])
    
    return transcription
