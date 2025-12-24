from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models.rfq import RFQ
from app.models.user import User

router = APIRouter()

@router.post("/rfqs")
async def create_rfq(
    title: str,
    description: str,
    part_description: str,
    quantity: int,
    buyer_id: str,
    target_price: Optional[float] = None,
    requirements: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Create a new RFQ"""
    rfq = RFQ(
        buyer_id=buyer_id,
        title=title,
        description=description,
        part_description=part_description,
        quantity=quantity,
        target_price=target_price,
        requirements=requirements,
        status="open"
    )
    db.add(rfq)
    db.commit()
    db.refresh(rfq)
    return {"id": rfq.id, "status": rfq.status, "message": "RFQ created successfully"}

@router.get("/rfqs")
async def list_rfqs(
    buyer_id: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List RFQs with optional filtering"""
    query = db.query(RFQ)
    
    if buyer_id:
        query =query.filter(RFQ.buyer_id == buyer_id)
    if status:
        query = query.filter(RFQ.status == status)
    
    rfqs = query.order_by(RFQ.created_at.desc()).all()
    
    return {
        "rfqs": [
            {
                "id": rfq.id,
                "title": rfq.title,
                "description": rfq.description,
                "quantity": rfq.quantity,
                "target_price": rfq.target_price,
                "status": rfq.status,
                "created_at": rfq.created_at.isoformat() if rfq.created_at else None
            }
            for rfq in rfqs
        ]
    }

@router.get("/rfqs/{rfq_id}")
async def get_rfq(rfq_id: str, db: Session = Depends(get_db)):
    """Get RFQ details"""
    rfq = db.query(RFQ).filter(RFQ.id == rfq_id).first()
    if not rfq:
        raise HTTPException(status_code=404, detail="RFQ not found")
    
    return {
        "id": rfq.id,
        "buyer_id": rfq.buyer_id,
        "title": rfq.title,
        "description": rfq.description,
        "part_description": rfq.part_description,
        "quantity": rfq.quantity,
        "target_price": rfq.target_price,
        "requirements": rfq.requirements,
        "status": rfq.status,
        "created_at": rfq.created_at.isoformat() if rfq.created_at else None
    }

@router.put("/rfqs/{rfq_id}")
async def update_rfq(
    rfq_id: str,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Update RFQ status"""
    rfq = db.query(RFQ).filter(RFQ.id == rfq_id).first()
    if not rfq:
        raise HTTPException(status_code=404, detail="RFQ not found")
    
    if status:
        rfq.status = status
    
    db.commit()
    return {"message": "RFQ updated successfully", "status": rfq.status}
