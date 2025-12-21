"""
Nexus Industrial - FastAPI Main Application
AI-Powered Industrial Spare Parts Marketplace
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
import time
import logging
from contextlib import asynccontextmanager

from app.config import settings
from app.database import engine, Base
from app.api import auth, search, rfq, parts, admin

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/app/logs/app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager for startup and shutdown events"""
    # Startup
    logger.info("🚀 Starting Nexus Industrial Backend...")
    
    # Create database tables
    Base.metadata.create_all(bind=engine)
    logger.info("✓ Database tables created")
    
    # Initialize AI services (lazy loading)
    logger.info("✓ AI services ready (lazy loading enabled)")
    
    # Initialize Qdrant collections
    try:
        from app.ai.qdrant_client import QdrantManager
        qdrant = QdrantManager()
        await qdrant.initialize_collections()
        logger.info("✓ Qdrant collections initialized")
    except Exception as e:
        logger.warning(f"⚠ Qdrant initialization deferred: {e}")
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down Nexus Industrial Backend...")

# Create FastAPI application
app = FastAPI(
    title="Nexus Industrial API",
    description="AI-Powered Industrial Spare Parts Marketplace for MENA Region",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Compression
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

# Bilingual response handler
@app.middleware("http")
async def language_middleware(request: Request, call_next):
    # Detect language from Accept-Language header or query param
    accept_lang = request.headers.get("Accept-Language", "en")
    lang = request.query_params.get("lang", accept_lang[:2].lower())
    
    # Validate language
    if lang not in ["en", "ar"]:
        lang = "en"
    
    # Attach to request state
    request.state.language = lang
    
    response = await call_next(request)
    return response

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(search.router, prefix="/api/search", tags=["Search"])
app.include_router(parts.router, prefix="/api/parts", tags=["Parts"])
app.include_router(rfq.router, prefix="/api/rfq", tags=["RFQ"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Nexus Industrial API",
        "version": "1.0.0",
        "docs": "/api/docs",
        "status": "operational"
    }

# Health check endpoint
@app.get("/api/health")
async def health_check():
    """Health check endpoint for monitoring"""
    try:
        # Check database connection
        from app.database import SessionLocal
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
    
    # Check Ollama connection
    try:
        import httpx
        response = httpx.get(f"{settings.OLLAMA_HOST}/api/tags", timeout=5.0)
        ollama_status = "healthy" if response.status_code == 200 else "unhealthy"
    except Exception as e:
        ollama_status = f"unhealthy: {str(e)}"
    
    # Check Qdrant connection
    try:
        import httpx
        response = httpx.get(f"{settings.QDRANT_HOST}/health", timeout=5.0)
        qdrant_status = "healthy" if response.status_code == 200 else "unhealthy"
    except Exception as e:
        qdrant_status = f"unhealthy: {str(e)}"
    
    overall_healthy = all(
        "healthy" in status 
        for status in [db_status, ollama_status, qdrant_status]
    )
    
    return {
        "status": "healthy" if overall_healthy else "degraded",
        "timestamp": time.time(),
        "services": {
            "database": db_status,
            "ollama": ollama_status,
            "qdrant": qdrant_status
        }
    }

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": "An unexpected error occurred. Please try again later.",
            "request_id": getattr(request.state, "request_id", None)
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )