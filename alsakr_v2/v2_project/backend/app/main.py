from fastapi import FastAPI, UploadFile, File, Form, Depends
from typing import Optional
from .core.es_client import es_client
from .agents.orchestrator import AgentManager

app = FastAPI(title="Al Sakr Online V2 - Agentic API")
agent_manager = AgentManager()

@app.on_event("startup")
async def startup_event():
    # Initialize Elasticsearch Indices
    await es_client.create_indices()
    print("🚀 API Started. Elasticsearch Ready.")

@app.post("/api/chat")
async def chat(message: str = Form(...), user_id: str = Form(...)):
    """The main entry point for the Command Center chat."""
    response = await agent_manager.handle_request(message, context={"user_id": user_id})
    return {"response": response}

@app.post("/api/vision/identify")
async def identify_part(file: UploadFile = File(...)):
    """Agent 1 entry point."""
    # Logic to save file and call VisualMatchAgent
    return {"status": "processing"}

@app.get("/api/health")
async def health():
    es_health = await es_client.check_health()
    return {"status": "healthy", "elasticsearch": es_health is not None}
