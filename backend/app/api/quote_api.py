from fastapi import APIRouter, Depends, HTTPException, Request, Form
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from app.database import get_db
from app.models.quote import Quote
from app.models.rfq import RFQ
from app.models.user import User
from app.models.order import Order
from app.models.notification import Notification
from app.api.notification_routes import create_notification
from app.api import deps

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
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
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
    
    # Override vendor_id with authenticated user's ID
    final_vendor_id = current_user.id
    
    quote = Quote(
        rfq_id=quote_data.rfq_id,
        vendor_id=final_vendor_id,
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
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """List quotes with optional filtering"""
    query = db.query(Quote)
    
    # Logic for visibility:
    # 1. Vendors see ONLY their own quotes.
    # 2. Buyers see ONLY quotes for their own RFQs.
    if current_user.role == "vendor":
        query = query.filter(Quote.vendor_id == current_user.id)
    elif current_user.role == "buyer":
        query = query.join(RFQ).filter(RFQ.buyer_id == current_user.id)
    elif current_user.role == "both":
        # Context dependent. If rfq_id is provided, check if user is owner of RFQ or Quote.
        if rfq_id:
            rfq = db.query(RFQ).filter(RFQ.id == rfq_id).first()
            if rfq and rfq.buyer_id == current_user.id:
                query = query.filter(Quote.rfq_id == rfq_id)
            else:
                query = query.filter(Quote.vendor_id == current_user.id, Quote.rfq_id == rfq_id)
        else:
            # Show all their activities? For safety, let's filter as vendor OR buyer owner.
            # This is complex for a simple query. Let's force vendor_id or rfq_id filter for "both".
            if vendor_id == current_user.id:
                query = query.filter(Quote.vendor_id == current_user.id)
            else:
                # Default to vendor quotes for simple listing
                query = query.filter(Quote.vendor_id == current_user.id)

    if vendor_id and current_user.role == "admin":
        query = query.filter(Quote.vendor_id == vendor_id)
    if rfq_id and current_user.role == "admin":
        query = query.filter(Quote.rfq_id == rfq_id)
    
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
async def get_quote(
    quote_id: str, 
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Get quote details"""
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    
    # Ownership check
    rfq = db.query(RFQ).filter(RFQ.id == quote.rfq_id).first()
    is_owner_vendor = quote.vendor_id == current_user.id
    is_owner_buyer = rfq and rfq.buyer_id == current_user.id
    
    if not (is_owner_vendor or is_owner_buyer or current_user.role == "admin"):
        raise HTTPException(status_code=403, detail="Not authorized to see this quote")
    
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
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Update quote status or details"""
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    
    # Authorization:
    # Vendors can update details (price, time, notes) of their own pending quotes.
    # Buyers can update status (accepted/rejected) of quotes for their own RFQs.
    
    rfq = db.query(RFQ).filter(RFQ.id == quote.rfq_id).first()
    is_vendor = quote.vendor_id == current_user.id
    is_buyer = rfq and rfq.buyer_id == current_user.id
    
    if not (is_vendor or is_buyer or current_user.role == "admin"):
        raise HTTPException(status_code=403, detail="Not authorized to update this quote")
    
    if status:
        # Only buyer or admin can accept/reject
        if not (is_buyer or current_user.role == "admin"):
            raise HTTPException(status_code=403, detail="Only the buyer can accept/reject quotes")
        
        quote.status = status
        
        # If accepted, update RFQ status and create Order
        if status == "accepted":
            # Update RFQ status
            rfq = db.query(RFQ).filter(RFQ.id == quote.rfq_id).first()
            if rfq:
                rfq.status = "closed"
            
            # Create Order automatically
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
