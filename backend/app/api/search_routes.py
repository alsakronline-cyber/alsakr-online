from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.ai.text_search import TextSearchEngine
from app.ai.vision_agent import VisionAgent
from app.ai.voice_processor import VoiceProcessor
import shutil
import os
import uuid

router = APIRouter()

# Initialize engines lazily or globally
text_search = TextSearchEngine()
vision_agent = VisionAgent()
voice_processor = VoiceProcessor()

@router.get("/text")
async def search_by_text(q: str):
    """Semantic search by text query."""
    if not q:
        return []
    results = await text_search.search_by_description(q)
    return results

@router.post("/image")
async def search_by_image(file: UploadFile = File(...)):
    """Search by uploading an image."""
    try:
        # Save temp file
        file_ext = file.filename.split(".")[-1]
        temp_filename = f"temp_{uuid.uuid4()}.{file_ext}"
        temp_path = os.path.join("data/images", temp_filename)
        os.makedirs("data/images", exist_ok=True)
        
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Process
        analysis = await vision_agent.identify_part_from_image(temp_path)
        
        # Cleanup (optional, or keep for debugging)
        # os.remove(temp_path)
        
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/voice")
async def search_by_voice(file: UploadFile = File(...)):
    """Search by voice command (transcribe + text search)."""
    try:
        # Save temp file
        file_ext = file.filename.split(".")[-1]
        temp_filename = f"temp_{uuid.uuid4()}.{file_ext}"
        temp_path = os.path.join("data/audio", temp_filename)
        os.makedirs("data/audio", exist_ok=True)
        
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Transcribe
        transcription = await voice_processor.transcribe_audio(temp_path)
        text_query = transcription.get("text")
        
        if not text_query:
            return {"transcription": "", "results": []}
            
        # Search
        results = await text_search.search_by_description(text_query)
        
        return {
            "transcription": text_query,
            "results": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
