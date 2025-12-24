from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.user import User
from app.models.rfq import RFQ
from app.models.quote import Quote
from app.models.order import Order
from typing import List
from pydantic import BaseModel

router = APIRouter()

class AdminStats(BaseModel):
    total_users: int
    total_rfqs: int
    total_quotes: int
    total_orders: int
    total_revenue: float
    active_vendors: int
    active_buyers: int

@router.get("/admin/stats", response_model=AdminStats)
async def get_admin_stats(db: Session = Depends(get_db)):
    try:
        total_users = db.query(User).count()
        total_rfqs = db.query(RFQ).count()
        total_quotes = db.query(Quote).count()
        total_orders = db.query(Order).count()
        
        revenue_result = db.query(func.sum(Order.total_amount)).scalar()
        total_revenue = float(revenue_result) if revenue_result else 0.0
        
        active_vendors = db.query(User).filter(User.role.in_(['vendor', 'both'])).count()
        active_buyers = db.query(User).filter(User.role.in_(['buyer', 'both'])).count()
        
        return {
            "total_users": total_users,
            "total_rfqs": total_rfqs,
            "total_quotes": total_quotes,
            "total_orders": total_orders,
            "total_revenue": total_revenue,
            "active_vendors": active_vendors,
            "active_buyers": active_buyers
        }
    except Exception as e:
        print(f"Error fetching admin stats: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/admin/users")
async def list_users(db: Session = Depends(get_db)):
    try:
        users = db.query(User).order_by(User.created_at.desc()).all()
        return users
    except Exception as e:
        print(f"Error listing users: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

class UserUpdateSchema(BaseModel):
    role: str = None
    is_active: bool = None

@router.put("/admin/users/{user_id}")
async def update_user_status(user_id: str, data: UserUpdateSchema, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if data.role is not None:
        user.role = data.role
    if data.is_active is not None:
        user.is_active = data.is_active
    
    db.commit()
    db.refresh(user)
    return user

# Scraper Management (Migrated from old admin.py)
@router.post("/admin/scrapers/{brand}/start")
async def start_scraper(brand: str):
    return {"status": "started", "brand": brand}

@router.post("/admin/scrapers/stop")
async def stop_all_scrapers():
    return {"status": "stopped"}
鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓鼓
