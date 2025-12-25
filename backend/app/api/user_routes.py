from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models.user import User
from app.api import deps

router = APIRouter()

@router.get("/users/{user_id}")
async def get_user_profile(
    user_id: str, 
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    # Authorization: Only own profile or admin
    if current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to view this profile")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "company_name": user.company_name,
        "role": user.role,
        "phone_number": user.phone_number,
        "industry_type": user.industry_type,
        "preferred_language": user.preferred_language,
        "created_at": user.created_at.isoformat() if user.created_at else None
    }

@router.put("/users/{user_id}")
async def update_user_profile(
    user_id: str,
    full_name: Optional[str] = None,
    company_name: Optional[str] = None,
    phone_number: Optional[str] = None,
    industry_type: Optional[str] = None,
    preferred_language: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    # Authorization: Only own profile or admin
    if current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update this profile")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if full_name is not None: user.full_name = full_name
    if company_name is not None: user.company_name = company_name
    if phone_number is not None: user.phone_number = phone_number
    if industry_type is not None: user.industry_type = industry_type
    if preferred_language is not None: user.preferred_language = preferred_language
    
    db.commit()
    return {"message": "Profile updated successfully"}
