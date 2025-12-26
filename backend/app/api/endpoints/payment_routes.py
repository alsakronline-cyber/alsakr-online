"""
Payment API Routes
Handles payment processing endpoints for Stripe and PayPal
"""

from fastapi import APIRouter, Depends, HTTPException, Request, Header
from sqlalchemy.orm import Session
from typing import Optional
import uuid
import logging

from app.database import get_db
from app.models.payment import Payment
from app.models.order import Order
from app.services.stripe_service import StripeService
from app.services.paypal_service import PayPalService
from app.api import deps

router = APIRouter()
logger = logging.getLogger(__name__)

# ==================== STRIPE ENDPOINTS ====================

@router.post("/payments/stripe/create-intent")
async def create_stripe_payment_intent(
    order_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(deps.get_current_user)
):
    """
    Create a Stripe PaymentIntent for an order
    """
    # Get order
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Verify user owns the order
    if order.buyer_id != current_user["sub"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check if payment already exists
    existing_payment = db.query(Payment).filter(Payment.order_id == order_id).first()
    if existing_payment and existing_payment.status in ["completed", "processing"]:
        raise HTTPException(status_code=400, detail="Payment already processed")
    
    # Create Stripe PaymentIntent
    result = await StripeService.create_payment_intent(
        amount=order.total_price,
        currency="usd",
        metadata={
            "order_id": order_id,
            "buyer_id": order.buyer_id
        }
    )
    
    # Create or update payment record
    if existing_payment:
        existing_payment.transaction_id = result["payment_intent_id"]
        existing_payment.status = "pending"
    else:
        payment = Payment(
            id=str(uuid.uuid4()),
            order_id=order_id,
            amount=order.total_price,
            currency="USD",
            provider="stripe",
            status="pending",
            transaction_id=result["payment_intent_id"]
        )
        db.add(payment)
    
    db.commit()
    
    return {
        "client_secret": result["client_secret"],
        "payment_intent_id": result["payment_intent_id"],
        "amount": result["amount"]
    }

@router.post("/payments/stripe/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Handle Stripe webhooks
    """
    payload = await request.body()
    
    # Verify webhook signature
    event = StripeService.verify_webhook_signature(payload, stripe_signature)
    
    # Handle different event types
    if event["type"] == "payment_intent.succeeded":
        payment_intent = event["data"]["object"]
        
        # Update payment status
        payment = db.query(Payment).filter(
            Payment.transaction_id == payment_intent["id"]
        ).first()
        
        if payment:
            payment.status = "completed"
            payment.payment_method = payment_intent.get("payment_method_types", ["card"])[0]
            
            # Update order status
            order = db.query(Order).filter(Order.id == payment.order_id).first()
            if order:
                order.payment_status = "paid"
                order.order_status = "confirmed"
            
            db.commit()
            logger.info(f"Payment completed for order {payment.order_id}")
    
    elif event["type"] == "payment_intent.payment_failed":
        payment_intent = event["data"]["object"]
        
        payment = db.query(Payment).filter(
            Payment.transaction_id == payment_intent["id"]
        ).first()
        
        if payment:
            payment.status = "failed"
            payment.error_message = payment_intent.get("last_payment_error", {}).get("message")
            db.commit()
            logger.error(f"Payment failed for order {payment.order_id}")
    
    return {"status": "success"}

# ==================== PAYPAL ENDPOINTS ====================

@router.post("/payments/paypal/create-order")
async def create_paypal_order(
    order_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(deps.get_current_user)
):
    """
    Create a PayPal order
    """
    # Get order
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Verify user owns the order
    if order.buyer_id != current_user["sub"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Create PayPal order
    result = await PayPalService.create_order(
        amount=order.total_price,
        currency="USD",
        order_id=order_id
    )
    
    # Create payment record
    payment = Payment(
        id=str(uuid.uuid4()),
        order_id=order_id,
        amount=order.total_price,
        currency="USD",
        provider="paypal",
        status="pending",
        transaction_id=result["order_id"]
    )
    db.add(payment)
    db.commit()
    
    return {
        "paypal_order_id": result["order_id"],
        "approval_url": result["approval_url"],
        "amount": result["amount"]
    }

@router.post("/payments/paypal/capture")
async def capture_paypal_order(
    paypal_order_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(deps.get_current_user)
):
    """
    Capture a PayPal order after user approval
    """
    # Find payment
    payment = db.query(Payment).filter(
        Payment.transaction_id == paypal_order_id
    ).first()
    
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    # Verify user
    order = db.query(Order).filter(Order.id == payment.order_id).first()
    if order.buyer_id != current_user["sub"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Capture the order
    result = await PayPalService.capture_order(paypal_order_id)
    
    # Update payment
    payment.status = "completed" if result["capture_status"] == "COMPLETED" else "failed"
    payment.payment_method = "paypal"
    
    # Update order
    if payment.status == "completed":
        order.payment_status = "paid"
        order.order_status = "confirmed"
    
    db.commit()
    
    return {
        "status": result["capture_status"],
        "capture_id": result["capture_id"],
        "amount": result["amount"]
    }

# ==================== GENERAL ENDPOINTS ====================

@router.get("/payments/{payment_id}")
async def get_payment_status(
    payment_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(deps.get_current_user)
):
    """
    Get payment status
    """
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    # Verify user owns the order
    order = db.query(Order).filter(Order.id == payment.order_id).first()
    if order.buyer_id != current_user["sub"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return {
        "payment_id": payment.id,
        "order_id": payment.order_id,
        "amount": payment.amount,
        "currency": payment.currency,
        "provider": payment.provider,
        "status": payment.status,
        "transaction_id": payment.transaction_id,
        "created_at": payment.created_at.isoformat() if payment.created_at else None
    }

@router.post("/payments/{payment_id}/refund")
async def refund_payment(
    payment_id: str,
    amount: Optional[float] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(deps.get_current_user)
):
    """
    Refund a payment (admin only or order owner)
    """
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    if payment.status != "completed":
        raise HTTPException(status_code=400, detail="Can only refund completed payments")
    
    # Process refund based on provider
    if payment.provider == "stripe":
        result = await StripeService.create_refund(
            payment_intent_id=payment.transaction_id,
            amount=amount,
            reason="requested_by_customer"
        )
    elif payment.provider == "paypal":
        result = await PayPalService.create_refund(
            capture_id=payment.transaction_id,
            amount=amount,
            currency=payment.currency
        )
    else:
        raise HTTPException(status_code=400, detail="Unsupported payment provider")
    
    # Update payment status
    payment.status = "refunded"
    
    # Update order
    order = db.query(Order).filter(Order.id == payment.order_id).first()
    if order:
        order.payment_status = "refunded"
        order.order_status = "cancelled"
    
    db.commit()
    
    return {
        "refund_id": result.get("refund_id"),
        "amount": result.get("amount"),
        "status": result.get("status")
    }
