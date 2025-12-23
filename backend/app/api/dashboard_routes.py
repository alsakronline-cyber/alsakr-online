from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.vendor import Vendor
from app.models.inquiry import Inquiry
from app.models.quote import Quote
import socket

router = APIRouter()

@router.get("/vendor/{vendor_id}/stats")
def get_vendor_stats(vendor_id: str, db: Session = Depends(get_db)):
    # 1. Active RFQs (Inquiries pending)
    # Ideally, this would be inquiries matched to this vendor that are pending.
    # For now, we count generic pending inquiries or Quotes by this vendor?
    # Let's count Inquiries where this vendor has NOT quoted yet but could? 
    # Or just count Quotes in progress.
    
    # Let's just count total pending inquiries in system as "New RFQs" for demo purposes 
    # if we don't have explicit "MatchedVendor" table yet.
    new_rfqs_count = db.query(Inquiry).filter(Inquiry.status == "pending").count()
    
    # 2. Active Quotations (Quotes submitted by this vendor)
    active_quotes_count = db.query(Quote).filter(Quote.vendor_id == vendor_id).count()
    
    # 3. Acceptance Rate (Mock logic or real calculation)
    # Count quotes where is_winner=True / total quotes
    total_quotes = active_quotes_count
    won_quotes = db.query(Quote).filter(Quote.vendor_id == vendor_id, Quote.is_winner == True).count()
    
    acceptance_rate = 0
    if total_quotes > 0:
        acceptance_rate = int((won_quotes / total_quotes) * 100)
    
    return {
        "new_rfqs": new_rfqs_count,
        "active_quotes": active_quotes_count,
        "acceptance_rate": acceptance_rate,
        # Mocking the daily change
        "new_rfqs_change": "+2 today",
        "active_quotes_expire": "1 expiring"
    }

@router.get("/vendor/{vendor_id}/inquiries")
def get_vendor_inquiries(vendor_id: str, db: Session = Depends(get_db)):
    """
    Returns list of Inquiries that are relevant to this vendor.
    """
    # For demo: Return all pending inquiries
    inquiries = db.query(Inquiry).filter(Inquiry.status != "closed").order_by(Inquiry.created_at.desc()).limit(10).all()
    
    result = []
    for inq in inquiries:
        # Check if this vendor has already quoted
        has_quoted = db.query(Quote).filter(Quote.inquiry_id == inq.id, Quote.vendor_id == vendor_id).first()
        
        result.append({
            "id": inq.id,
            "rfq_id": f"RFQ-{inq.id[:8]}", # Mock ID format
            "part_name": "Part " + inq.part_id[:8], # Mock part name if relation not fully loaded
            "part_description": inq.notes or "No description",
            "quantity": inq.quantity,
            "status": "Quoted" if has_quoted else "New",
            "created_at": inq.created_at
        })
        
    return result
