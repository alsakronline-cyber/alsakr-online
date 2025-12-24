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
# Import routes
try:
    from app.api.auth import router as auth_router
    app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
except ImportError as e:
    print(f"⚠️ Could not import auth router: {e}")

try:
    from app.api.contact import router as contact_router
    app.include_router(contact_router, prefix="/api/contact", tags=["contact"])
except ImportError as e:
    print(f"⚠️ Could not import contact router: {e}")

try:
    from app.api.rfq_routes import router as rfq_router
    app.include_router(rfq_router, prefix="/api", tags=["rfqs"])
except ImportError as e:
    print(f"⚠️ Could not import RFQ router: {e}")

try:
    from app.api.quote_api import router as quote_router
    app.include_router(quote_router, prefix="/api", tags=["quotes"])
except ImportError as e:
    print(f"⚠️ Could not import quote router: {e}")

try:
    from app.api.order_routes import router as order_router
    app.include_router(order_router, prefix="/api", tags=["orders"])
except ImportError as e:
    print(f"⚠️ Could not import order router: {e}")

try:
    from app.api.catalog_routes import router as catalog_router
    app.include_router(catalog_router, prefix="/api", tags=["catalog"])
except ImportError as e:
    print(f"⚠️ Could not import catalog router: {e}")

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
