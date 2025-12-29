from fastapi import FastAPI, UploadFile, File, Form, Depends, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Dict
from pydantic import BaseModel
from .core.es_client import es_client
from .agents.orchestrator import AgentManager
from .core.search_service import SearchService
from .core.smart_search_service import SmartSearchService
from .core.voice_service import VoiceService
from .core.inquiry_service import InquiryService, InquiryCreate
from .core.quote_service import QuoteService, QuoteCreate
from .core.chat_service import ChatService, MessageCreate
from fastapi import FastAPI, HTTPException, Body

from .agents.vision_agent import VisualMatchAgent

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
search_service = SearchService()
smart_search_service = SmartSearchService()
voice_service = VoiceService()
inquiry_service = InquiryService()
quote_service = QuoteService()
chat_service = ChatService()



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


@app.post("/api/vision/identify")
async def identify_part(file: UploadFile = File(...)):
    """Identify part from uploaded image"""
    # 1. Save temp
    temp_filename = f"temp_{file.filename}"
    with open(temp_filename, "wb") as buffer:
        buffer.write(await file.read())
    
    # 2. Process
    try:
        agent = VisualMatchAgent()
        result = await agent.identify_and_match(temp_filename, mode="path")
    finally:
        # Cleanup
        if os.path.exists(temp_filename):
            os.remove(temp_filename)
            
    return result

@app.post("/api/voice/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    """Transcribe uploaded audio file to text"""
    text = await voice_service.transcribe(file)
    return {"text": text}


# ============= INQUIRY ENDPOINTS =============

@app.post("/api/inquiries")
async def create_inquiry(inquiry: InquiryCreate):
    """Create a new buyer inquiry"""
    return await inquiry_service.create_inquiry(inquiry)

@app.get("/api/inquiries")
async def get_inquiries():
    """Get all inquiries for vendor dashboard"""
    return await inquiry_service.get_vendor_inquiries()

@app.get("/api/inquiries/buyer/{buyer_id}")
async def get_buyer_inquiries_endpoint(buyer_id: str):
    """Get inquiries for a specific buyer"""
    return await inquiry_service.get_buyer_inquiries(buyer_id)

# ============= QUOTE ENDPOINTS =============

@app.post("/api/quotes")
async def create_quote(quote: QuoteCreate):
    """Submit a new vendor quotation"""
    return await quote_service.create_quote(quote)

@app.get("/api/quotes/inquiry/{inquiry_id}")
async def get_quotes(inquiry_id: str):
    """Get all quotes for a specific inquiry"""
    return await quote_service.get_quotes_for_inquiry(inquiry_id)

@app.patch("/api/quotes/{quote_id}/status")
async def update_quote_status(quote_id: str, status: str = Body(..., embed=True)):
    """Update quote status (accepted/rejected)"""
    return await quote_service.update_quote_status(quote_id, status)

# ============= CHAT ENDPOINTS =============

@app.post("/api/chat/message")
async def send_chat_message(message: MessageCreate):
    """Send a message in the buyer-vendor chat"""
    return await chat_service.send_message(message)

@app.get("/api/chat/history/{inquiry_id}")
async def get_chat_history(inquiry_id: str):
    """Get chat history for an inquiry"""
    return await chat_service.get_messages(inquiry_id)



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
