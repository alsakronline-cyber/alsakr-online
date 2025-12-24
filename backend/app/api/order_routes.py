from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.order import Order
from app.models.quote import Quote
from app.api.notification_routes import create_notification

router = APIRouter()

@router.post("/orders")
async def create_order(
    quote_id: str,
    buyer_id: str,
    shipping_address: Optional[str] = None,
    notes: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Create an order from an accepted quote"""
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    
    if quote.status != "accepted":
        raise HTTPException(status_code=400, detail="Quote must be accepted before creating order")
    
    order = Order(
        quote_id=quote_id,
        buyer_id=buyer_id,
        vendor_id=quote.vendor_id,
        total_amount=quote.price,
        currency=quote.currency,
        shipping_address=shipping_address,
        notes=notes,
        status="pending"
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    
    return {"id": order.id, "status": order.status, "message": "Order created successfully"}

@router.get("/orders")
async def list_orders(
    buyer_id: Optional[str] = None,
    vendor_id: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List orders with optional filtering"""
    query = db.query(Order)
    
    if buyer_id:
        query = query.filter(Order.buyer_id == buyer_id)
    if vendor_id:
        query = query.filter(Order.vendor_id == vendor_id)
    if status:
        query = query.filter(Order.status == status)
    
    orders = query.order_by(Order.created_at.desc()).all()
    
    return {
        "orders": [
            {
                "id": order.id,
                "buyer_id": order.buyer_id,
                "vendor_id": order.vendor_id,
                "total_amount": order.total_amount,
                "status": order.status,
                "tracking_number": order.tracking_number,
                "created_at": order.created_at.isoformat() if order.created_at else None
            }
            for order in orders
        ]
    }

@router.get("/orders/{order_id}")
async def get_order(order_id: str, db: Session = Depends(get_db)):
    """Get order details"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {
        "id": order.id,
        "quote_id": order.quote_id,
        "buyer_id": order.buyer_id,
        "vendor_id": order.vendor_id,
        "total_amount": order.total_amount,
        "currency": order.currency,
        "status": order.status,
        "shipping_address": order.shipping_address,
        "tracking_number": order.tracking_number,
        "notes": order.notes,
        "created_at": order.created_at.isoformat() if order.created_at else None
    }

@router.put("/orders/{order_id}")
async def update_order(
    order_id: str,
    status: Optional[str] = None,
    tracking_number: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Update order (vendor updates shipping status)"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    db.commit()

    # Notify Buyer of update
    create_notification(
        db,
        user_id=order.buyer_id,
        type="order_update",
        message=f"Order ORD-{order.id[:8].upper()} has been updated to: {order.status}",
        related_id=order.id
    )

    return {"message": "Order updated successfully", "status": order.status}
