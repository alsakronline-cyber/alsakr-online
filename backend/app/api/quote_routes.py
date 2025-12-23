from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.quote import Quote
from app.models.inquiry import Inquiry
from app.models.vendor import Vendor
from app.services.ai_service import AIService
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/email-hook")
def receive_vendor_quote_email(
    payload: dict = Body(...), 
    db: Session = Depends(get_db)
):
    """
    Webhook endpoint to receive parsed email content from an email provider.
    Payload expected to contain 'from_email', 'subject', 'text_body'.
    """
    from_email = payload.get("from_email")
    email_body = payload.get("text_body", "")
    subject = payload.get("subject", "")
    
    # 1. Identify Vendor
    vendor = db.query(Vendor).filter(Vendor.contact_email == from_email).first()
    if not vendor:
        logger.warning(f"Received quote from unknown vendor: {from_email}")
        return {"status": "ignored", "reason": "unknown_vendor"}

    # 2. Identify Inquiry (Mock logic: extract ID from subject or body??)
    # For this demo, we assume the subject contains "RFQ: <PartName>" and we find the latest open inquiry for that part?
    # Or cleaner: The email subject had the Inquiry ID. Let's pretend it did.
    # We will just pick the latest pending inquiry for simplicity in this mock.
    latest_inquiry = db.query(Inquiry).filter(Inquiry.status == "pending").order_by(Inquiry.created_at.desc()).first()
    
    if not latest_inquiry:
        return {"status": "ignored", "reason": "no_pending_inquiry"}

    # 3. AI Parsing
    parsed_data = AIService.parse_vendor_quote(email_body)
    
    # 4. Save Quote
    new_quote = Quote(
        inquiry_id=latest_inquiry.id,
        vendor_id=vendor.id,
        price=parsed_data.get("price"),
        currency=parsed_data.get("currency"),
        lead_time=parsed_data.get("lead_time"),
        availability=parsed_data.get("availability"),
        shipping_cost=parsed_data.get("shipping_cost"),
        raw_email_content=email_body
    )
    
    db.add(new_quote)
    db.commit()
    db.refresh(new_quote)
    
    # Update Inquiry status
    latest_inquiry.status = "quoted"
    db.commit()
    
    return {
        "status": "success", 
        "quote_id": new_quote.id, 
        "extracted_data": parsed_data
    }
