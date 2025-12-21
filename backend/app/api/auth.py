from fastapi import APIRouter

router = APIRouter()

@router.post("/login")
async def login():
    return {"token": "fake-jwt-token"}

@router.post("/register")
async def register():
    return {"message": "User registered"}
