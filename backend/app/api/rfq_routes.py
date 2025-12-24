from fastapi import APIRouter, Depends, HTTPException, Form, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

from app.database import get_db
from app.models.rfq import RFQ
from app.models.user import User

router = APIRouter()

class RFQCreate(BaseModel):
    title: str = "New RFQ"
    description: Optional[str] = ""
    part_description: Optional[str] = ""
    quantity: int = 1
    buyer_id: str
    target_price: Optional[float] = None
    requirements: Optional[str] = None
    attachments: Optional[str] = None

    @classmethod
    def as_form(
        cls,
        title: str = Form("New RFQ"),
        description: Optional[str] = Form(""),
        part_description: Optional[str] = Form(""),
        quantity: int = Form(1),
        buyer_id: str = Form(...),
        target_price: Optional[float] = Form(None),
        requirements: Optional[str] = Form(None),
        attachments: Optional[str] = Form(None)
    ):
        return cls(
            title=title,
            description=description,
            part_description=part_description,
            quantity=quantity,
            buyer_id=buyer_id,
            target_price=target_price,
            requirements=requirements
        )

@router.post("/rfqs")
async def create_rfq(
    request: Request,
    db: Session = Depends(get_db)
):
    """Create a new RFQ supporting both JSON and Form data"""
    # Detect content type
    content_type = request.headers.get("Content-Type", "")
    
    if "application/json" in content_type:
        data = await request.json()
        rfq_data = RFQCreate(**data)
    else:
        form_data = await request.form()
        rfq_data = RFQCreate(
            title=form_data.get("title", "New RFQ"),
            description=form_data.get("description", ""),
            part_description=form_data.get("part_description", ""),
            quantity=int(form_data.get("quantity", 1)),
            buyer_id=form_data.get("buyer_id"),
            target_price=float(form_data.get("target_price")) if form_data.get("target_price") else None,
            requirements=form_data.get("requirements", ""),
            attachments=form_data.get("attachments", "")
        )

    print(f"DEBUG: Processed RFQ data: {rfq_data.model_dump()}")
    rfq = RFQ(
        buyer_id=rfq_data.buyer_id,
        title=rfq_data.title,
        description=rfq_data.description,
        part_description=rfq_data.part_description,
        quantity=rfq_data.quantity,
        target_price=rfq_data.target_price,
        requirements=rfq_data.requirements,
        attachments=rfq_data.attachments,
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
                "attachments": rfq.attachments,
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
        "attachments": rfq.attachments,
        "status": rfq.status,
        "created_at": rfq.created_at.isoformat() if rfq.created_at else None
    }

@router.put("/rfqs/{rfq_id}")
async def update_rfq(
    rfq_id: str,
    title: Optional[str] = None,
    description: Optional[str] = None,
    part_description: Optional[str] = None,
    quantity: Optional[int] = None,
    target_price: Optional[float] = None,
    requirements: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Update RFQ details"""
    rfq = db.query(RFQ).filter(RFQ.id == rfq_id).first()
    if not rfq:
        raise HTTPException(status_code=404, detail="RFQ not found")
    
    if title is not None: rfq.title = title
    if description is not None: rfq.description = description
    if part_description is not None: rfq.part_description = part_description
    if quantity is not None: rfq.quantity = quantity
    if target_price is not None: rfq.target_price = target_price
    if requirements is not None: rfq.requirements = requirements
    if status is not None: rfq.status = status
    
    db.commit()
    return {"message": "RFQ updated successfully", "status": rfq.status}
