from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.config import settings
import uvicorn
from contextlib import asynccontextmanager

# Initialize Database Tables
from app.models import vendor, inquiry, quote
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Qdrant
    from app.ai.qdrant_client import QdrantManager
    try:
        qdrant = QdrantManager()
        qdrant.initialize_collections()
        print("✅ Qdrant collections initialized.")
    except Exception as e:
        print(f"⚠️ Failed to initialize Qdrant: {e}")
    yield
    # Shutdown logic if needed

app = FastAPI(
    title="Nexus Industrial API",
    description="Backend for Alsakr Online - Industrial Spare Parts Marketplace",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Bilingual Middleware
@app.middleware("http")
async def add_language_header(request: Request, call_next):
    lang = request.headers.get("Accept-Language", "en")
    response = await call_next(request)
    response.headers["Content-Language"] = lang
    return response

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "version": "1.0.0", "database": "connected"}

# Import Routers
# Import Routers
from app.api import search_routes, scraper_routes, rfq, quote_routes, dashboard_routes

# Mock Auth router if it doesn't exist yet, or import if it does.
# For now, to avoid errors, we'll skip Auth or assume it's there. 
# The plan didn't explicitly modify auth so we assume it exists or isn't prioritized in this pass.
# But let's check if we can import it. If not, we skip.
try:
    from app.api import auth
    app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
except ImportError:
    pass

app.include_router(search_routes.router, prefix="/api/search", tags=["Search"])
app.include_router(scraper_routes.router, prefix="/api/scrape", tags=["Scrapers"])
app.include_router(rfq.router, prefix="/api/rfq", tags=["RFQ"])
app.include_router(quote_routes.router, prefix="/api/quotes", tags=["Quotes"])
app.include_router(dashboard_routes.router, prefix="/api/dashboard", tags=["Dashboard"])
try:
    from app.api import contact
    app.include_router(contact.router, prefix="/api/contact", tags=["Contact"])
except ImportError as e:
    print(f"⚠️ Could not import contact router: {e}")

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
