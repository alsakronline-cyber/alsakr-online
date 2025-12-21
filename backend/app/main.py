from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api import auth, search, rfq, admin

app = FastAPI(
    title="Alsakr Online API",
    version="1.0.0",
    description="AI-Powered Industrial Spare Parts Marketplace"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://app.alsakronline.com",
        "https://alsakr-online-frontend"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(search.router, prefix="/api/search", tags=["Search"])
app.include_router(rfq.router, prefix="/api/rfq", tags=["RFQ"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])

@app.get("/")
async def root():
    return {"message": "Alsakr Online API Operational"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}
