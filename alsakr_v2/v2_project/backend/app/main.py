from fastapi import FastAPI, UploadFile, File, Form, Depends, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Dict
from pydantic import BaseModel
from .core.es_client import es_client
from .agents.orchestrator import AgentManager
from .core.smart_search_service import SmartSearchService

app = FastAPI(
    title="Al Sakr Online V2 - Agentic API",
    description="Industrial AI Platform for SICK Product Intelligence",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

agent_manager = AgentManager()
search_service = SearchService()
smart_search_service = SmartSearchService()


# Pydantic models
class SemanticSearchRequest(BaseModel):
    query: str
    limit: int = 10

class SmartSearchRequest(BaseModel):
    query: str
    context: Optional[List[Dict]] = None


@app.get("/")
async def root():
    return {
        "name": "Al Sakr Online V2 API",
        "version": "2.0.0",
        "agents": 10,
        "status": "online",
        "docs": "/docs",
        "endpoints": {
            "chat": "/api/chat",
            "search": "/api/search/products",
            "smart_search": "/api/search/smart",
            "semantic": "/api/search/semantic",
            "health": "/api/health"
        }
    }


@app.on_event("startup")
async def startup_event():
    # Initialize Elasticsearch Indices
    await es_client.create_indices()
    print("🚀 API Started. Elasticsearch Ready.")


# ============= CHAT & AGENTS =============

@app.post("/api/chat")
async def chat(message: str = Form(...), user_id: str = Form(...)):
    """Main chat endpoint for Command Center"""
    response = await agent_manager.handle_request(message, context={"user_id": user_id})
    return {"response": response}


@app.post("/api/vision/identify")
async def identify_part(file: UploadFile = File(...)):
    """Vision agent endpoint for image-based product identification"""
    # Logic to save file and call VisualMatchAgent
    return {"status": "processing"}


# ============= SEARCH ENDPOINTS =============

@app.get("/api/search/products")
async def search_products(
    q: str = Query(..., description="Search query"),
    size: int = Query(10, ge=1, le=100),
    category: Optional[str] = None,
    phased_out: Optional[bool] = None
):
    """Full-text product search"""
    filters = {}
    if category:
        filters['category'] = category
    if phased_out is not None:
        filters['phased_out'] = phased_out
    
    results = search_service.text_search(q, size=size, filters=filters)
    
    return {
        "query": q,
        "total": len(results),
        "results": results
    }


@app.post("/api/search/semantic")
async def semantic_search(request: SemanticSearchRequest):
    """Semantic vector search using Qdrant"""
    results = search_service.semantic_search(request.query, limit=request.limit)
    
    return {
        "query": request.query,
        "total": len(results),
        "results": results
    }


@app.post("/api/search/smart")
async def smart_search(request: SmartSearchRequest):
    """
    Intelligent search with ambiguity detection and result categorization.
    Returns:
    - {"type": "clarification", "question": "..."}
    - {"type": "results", "matches": [...], "alternatives": [...]}
    """
    return smart_search_service.smart_search(request.query)


@app.get("/api/search/hybrid")
async def hybrid_search(
    q: str = Query(..., description="Search query"),
    size: int = Query(10, ge=1, le=50)
):
    """Hybrid search combining text and semantic"""
    results = search_service.hybrid_search(q, size=size)
    
    return {
        "query": q,
        "total": len(results),
        "results": results
    }


@app.get("/api/products/{part_number}")
async def get_product(part_number: str):
    """Get product details by part number"""
    product = search_service.get_product(part_number)
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return product


@app.get("/api/products/{part_number}/similar")
async def get_similar(part_number: str, limit: int = Query(5, ge=1, le=20)):
    """Get similar products"""
    similar = search_service.get_similar_products(part_number, limit=limit)
    
    return {
        "part_number": part_number,
        "similar_products": similar
    }


@app.get("/api/categories")
async def get_categories():
    """Get all product categories"""
    categories = search_service.get_categories()
    
    return {
        "total": len(categories),
        "categories": categories
    }


# ============= DATA MANAGEMENT =============

@app.get("/api/data/status")
async def data_status():
    """Check data ingestion status"""
    from elasticsearch import Elasticsearch
    from qdrant_client import QdrantClient
    from .core.config import get_es_url, get_qdrant_url, settings
    
    es = Elasticsearch([get_es_url()])
    qdrant = QdrantClient(url=get_qdrant_url())
    
    status = {
        "elasticsearch": {
            "connected": False,
            "products_count": 0,
            "pdf_count": 0
        },
        "qdrant": {
            "connected": False,
            "vectors_count": 0
        }
    }
    
    # Check Elasticsearch
    try:
        if es.ping():
            status["elasticsearch"]["connected"] = True
            
            # Get product count
            if es.indices.exists(index=settings.ES_PRODUCTS_INDEX):
                count = es.count(index=settings.ES_PRODUCTS_INDEX)
                status["elasticsearch"]["products_count"] = count['count']
            
            # Get PDF count
            if es.indices.exists(index=settings.ES_PDF_INDEX):
                count = es.count(index=settings.ES_PDF_INDEX)
                status["elasticsearch"]["pdf_count"] = count['count']
    except:
        pass
    
    # Check Qdrant
    try:
        collections = qdrant.get_collections()
        status["qdrant"]["connected"] = True
        
        # Get vector count
        for collection in collections.collections:
            if collection.name == settings.QDRANT_PRODUCTS_COLLECTION:
                info = qdrant.get_collection(collection.name)
                status["qdrant"]["vectors_count"] = info.points_count
    except:
        pass
    
    return status


# ============= HEALTH CHECKS =============

@app.get("/api/health")
async def health():
    es_health = await es_client.check_health()
    return {
        "status": "healthy",
        "elasticsearch": es_health is not None,
        "version": "2.0.0"
    }
