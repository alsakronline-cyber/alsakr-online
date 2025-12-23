from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.inquiry import Inquiry
from app.services.vendor_service import VendorService
from app.services.email_service import EmailService
from pydantic import BaseModel
import datetime

router = APIRouter()

class RFQCreate(BaseModel):
    part_id: str
    quantity: int
    urgency_level: str
    notes: str = None
    # For now, simplistic input. 
    # In reality, we might need part details passed in if not looking up by ID completely yet.
    mock_part_name: str = "Unknown Part" 
    mock_part_desc: str = "Description..."

@router.post("/")
def create_rfq(rfq: RFQCreate, db: Session = Depends(get_db)):
    # 1. Create Inquiry Record
    new_inquiry = Inquiry(
        part_id=rfq.part_id, # Assumes part exists or is mock string
        quantity=rfq.quantity,
        urgency_level=rfq.urgency_level,
        notes=rfq.notes,
        status="pending",
        user_id="user-123" # Mock User ID for now
    )
    db.add(new_inquiry)
    db.commit()
    db.refresh(new_inquiry)
    
    # 2. Automatch Vendors
    matched_vendors = VendorService.automatch_vendors(db)
    
    # 3. Send Emails
    email_count = 0
    for vendor in matched_vendors:
        if vendor.contact_email:
            rfq_details = {
                "part_name": rfq.mock_part_name,
                "part_number": rfq.part_id, # Using ID as number for mock
                "part_description": rfq.mock_part_desc,
                "quantity": rfq.quantity
            }
            EmailService.send_rfq_email(vendor.contact_email, rfq_details)
            email_count += 1
            
    return {
        "message": "RFQ created and sent to vendors",
        "inquiry_id": new_inquiry.id,
        "vendors_contacted": email_count
    }
