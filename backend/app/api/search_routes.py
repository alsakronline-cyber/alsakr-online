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
    
    # Mocking conversion of Qdrant results to response
    formatted_results = [] # Transform logic here
    
    return SearchResponse(
        results=formatted_results,
        query_time_ms=(time.time() - start_time) * 1000,
        total_found=len(results)
    )

@router.post("/image")
async def search_image(file: UploadFile = File(...)):
    agent = VisionAgent()
    # Save temp file logic here
    return {"status": "Analysis complete (mock)"}

@router.post("/voice")
async def search_voice(file: UploadFile = File(...)):
    processor = VoiceProcessor()
    # Save temp file logic here
    transcription = await processor.transcribe_audio("temp_audio.wav")
    return transcription
