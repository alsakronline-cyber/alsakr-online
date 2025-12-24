from fastapi import APIRouter, Depends, HTTPException, Request, Form
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from app.database import get_db
from app.models.quote import Quote
from app.models.notification import Notification
from app.api.notification_routes import create_notification

from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class QuoteCreate(BaseModel):
    rfq_id: str
    vendor_id: str
    price: float
    delivery_time: str
    currency: str = "USD"
    notes: Optional[str] = None

@router.post("/quotes")
async def create_quote(
    request: Request,
    db: Session = Depends(get_db)
):
    """Create a vendor quote supporting both JSON and Form data"""
    content_type = request.headers.get("Content-Type", "")
    
    if "application/json" in content_type:
        data = await request.json()
        quote_data = QuoteCreate(**data)
    else:
        form_data = await request.form()
        quote_data = QuoteCreate(
            rfq_id=form_data.get("rfq_id"),
            vendor_id=form_data.get("vendor_id"),
            price=float(form_data.get("price")),
            delivery_time=form_data.get("delivery_time"),
            currency=form_data.get("currency", "USD"),
            notes=form_data.get("notes")
        )

    print(f"DEBUG: Processed Quote data: {quote_data.model_dump()}")

    # Verify RFQ exists
    rfq = db.query(RFQ).filter(RFQ.id == quote_data.rfq_id).first()
    if not rfq:
        raise HTTPException(status_code=404, detail="RFQ not found")
    
    quote = Quote(
        rfq_id=quote_data.rfq_id,
        vendor_id=quote_data.vendor_id,
        price=quote_data.price,
        currency=quote_data.currency,
        delivery_time=quote_data.delivery_time,
        notes=quote_data.notes,
        status="pending",
        is_winner=False
    )
    db.add(quote)
    
    # Update RFQ status if it was open
    if rfq.status == "open":
        rfq.status = "quoted"
    
    db.commit()
    db.refresh(quote)
    
    return {"id": quote.id, "message": "Quote submitted successfully"}

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
                "notes": quote.notes,
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
    status: Optional[str] = None,
    price: Optional[float] = None,
    delivery_time: Optional[str] = None,
    notes: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Update quote status or details"""
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    
    if status:
        quote.status = status
        
        # If accepted, update RFQ status and create Order
        if status == "accepted":
            from app.models.rfq import RFQ
            rfq = db.query(RFQ).filter(RFQ.id == quote.rfq_id).first()
            if rfq:
                rfq.status = "closed"
            
            # Create Order automatically
            from app.models.order import Order
            order = Order(
                quote_id=quote.id,
                buyer_id=rfq.buyer_id if rfq else None,
                vendor_id=quote.vendor_id,
                total_amount=quote.price,
                currency=quote.currency,
                status="pending"
            )
            db.add(order)
            
            # Notify Vendor of acceptance
            create_notification(
                db,
                user_id=quote.vendor_id,
                type="quote_accepted",
                message=f"Your quote for {rfq.title if rfq else 'RFQ'} has been accepted!",
                related_id=quote.id
            )
        elif status == "rejected":
            # Notify Vendor of rejection
            create_notification(
                db,
                user_id=quote.vendor_id,
                type="quote_rejected",
                message=f"Your quote for {quote.rfq_id} was declined.",
                related_id=quote.id
            )

    if price is not None: quote.price = price
    if delivery_time is not None: quote.delivery_time = delivery_time
    if notes is not None: quote.notes = notes
    
    db.commit()
    return {"message": "Quote updated successfully", "status": quote.status}
