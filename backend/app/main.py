from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.config import settings
import uvicorn
from contextlib import asynccontextmanager

# Initialize Database Tables
from app.models import vendor, inquiry, quote, user, rfq, order, product, part, search, notification
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

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    print(f"❌ VALIDATION ERROR at {request.url.path}: {exc.errors()}")
    print(f"📝 Raw Body: {await request.body()}")
    return JSONResponse(
        status_code=422,
        content=jsonable_encoder({"detail": exc.errors(), "body": str(await request.body())}),
    )

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.staticfiles import StaticFiles
import os

# Create uploads directory if not exists
if not os.path.exists("uploads"):
    os.makedirs("uploads")

# Mount Static Files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.middleware("http")
async def add_language_header(request: Request, call_next):
    lang = request.headers.get("Accept-Language", "en")
    response = await call_next(request)
    response.headers["Content-Language"] = lang
    return response

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "version": "1.0.0", "database": "connected"}

from app.api import search_routes, scraper_routes, auth, rfq_routes, quote_api, order_routes, catalog_routes, dashboard_routes, contact, notification_routes, upload_routes, user_routes, admin_routes

# Register Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(search_routes.router, prefix="/api/search", tags=["Search"])
app.include_router(scraper_routes.router, prefix="/api/scrape", tags=["Scrapers"])
app.include_router(rfq_routes.router, prefix="/api", tags=["RFQs"])
app.include_router(quote_api.router, prefix="/api", tags=["Quotes"])
app.include_router(order_routes.router, prefix="/api", tags=["Orders"])
app.include_router(catalog_routes.router, prefix="/api", tags=["Catalog"])
app.include_router(dashboard_routes.router, prefix="/api", tags=["Dashboard"])
app.include_router(contact.router, prefix="/api/contact", tags=["Contact"])
app.include_router(notification_routes.router, prefix="/api", tags=["Notifications"])
app.include_router(upload_routes.router, prefix="/api", tags=["Uploads"])
app.include_router(user_routes.router, prefix="/api", tags=["User Profile"])
app.include_router(admin_routes.router, prefix="/api", tags=["Admin"])

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓
