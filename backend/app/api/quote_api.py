from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from app.database import get_db
from app.models.quote import Quote
from app.models.rfq import RFQ

router = APIRouter()

@router.post("/quotes")
async def create_quote(
    rfq_id: str,
    vendor_id: str,
    price: float,
    delivery_time: str,
    notes: Optional[str] = None,
    currency: str = "USD",
    db: Session = Depends(get_db)
):
    """Create a vendor quote for an RFQ"""
    # Verify RFQ exists
    rfq = db.query(RFQ).filter(RFQ.id == rfq_id).first()
    if not rfq:
        raise HTTPException(status_code=404, detail="RFQ not found")
    
    quote = Quote(
        rfq_id=rfq_id,
        vendor_id=vendor_id,
        price=price,
        currency=currency,
        delivery_time=delivery_time,
        notes=notes,
        status="pending"
    )
    db.add(quote)
    
    # Update RFQ status to "quoted" if it was "open"
    if rfq.status == "open":
        rfq.status = "quoted"
    
    db.commit()
    db.refresh(quote)
    
    return {"id": quote.id, "status": quote.status, "message": "Quote submitted successfully"}

@router.get("/quotes")
async def list_quotes(
    rfq_id: Optional[str] = None,
    vendor_id: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List quotes with optional filtering"""
    query = db.query(Quote)
    
    if rfq_id:
        query = query.filter(Quote.rfq_id == rfq_id)
    if vendor_id:
        query = query.filter(Quote.vendor_id == vendor_id)
    if status:
        query = query.filter(Quote.status == status)
    
    quotes = query.order_by(Quote.created_at.desc()).all()
    
    return {
        "quotes": [
            {
                "id": quote.id,
                "rfq_id": quote.rfq_id,
                "vendor_id": quote.vendor_id,
                "price": quote.price,
                "currency": quote.currency,
                "delivery_time": quote.delivery_time,
                "status": quote.status,
                "created_at": quote.created_at.isoformat() if quote.created_at else None
            }
            for quote in quotes
        ]
    }

@router.get("/quotes/{quote_id}")
async def get_quote(quote_id: str, db: Session = Depends(get_db)):
    """Get quote details"""
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    
    return {
        "id": quote.id,
        "rfq_id": quote.rfq_id,
        "vendor_id": quote.vendor_id,
        "price": quote.price,
        "currency": quote.currency,
        "delivery_time": quote.delivery_time,
        "notes": quote.notes,
        "status": quote.status,
        "created_at": quote.created_at.isoformat() if quote.created_at else None
    }

@router.put("/quotes/{quote_id}")
async def update_quote_status(
    quote_id: str,
    status: str,  # accepted, rejected
    db: Session = Depends(get_db)
):
    """Update quote status (buyer accepts/rejects)"""
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    
    quote.status = status
    
    # If accepted, update RFQ status
    if status == "accepted":
        rfq = db.query(RFQ).filter(RFQ.id == quote.rfq_id).first()
        if rfq:
            rfq.status = "closed"
    
    db.commit()
    return {"message": f"Quote {status}", "status": quote.status}
