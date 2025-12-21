from fastapi import APIRouter

router = APIRouter()

@router.post("/")
async def create_rfq():
    return {"id": "rfq-123", "status": "draft"}
