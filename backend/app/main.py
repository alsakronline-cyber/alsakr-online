from fastapi import FastAPI, Depends, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base, get_db
from sqlalchemy.orm import Session
from app.models import user, part, inquiry, vendor
import uvicorn

# Initialize Database
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Nexus Industrial API",
    description="Backend for Alsakr Online - Industrial Spare Parts Marketplace",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api import search_routes, scraper_routes, auth, admin

app.include_router(auth.router)
app.include_router(search_routes.router)
app.include_router(scraper_routes.router)
app.include_router(admin.router)

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "version": "1.0.0"}

@app.on_event("startup")
async def startup_event():
    from app.ai.qdrant_client import QdrantManager
    try:
        qdrant = QdrantManager()
        qdrant.initialize_collections()
        print("✅ Qdrant collections initialized.")
    except Exception as e:
        print(f"⚠️ Failed to initialize Qdrant: {e}")

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
