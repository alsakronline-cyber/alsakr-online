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
    try:
        # 1. Active RFQs (Inquiries pending)
        new_rfqs_count = db.query(Inquiry).filter(Inquiry.status == "pending").count()
        
        # 2. Active Quotations (Quotes submitted by this vendor)
        active_quotes_count = db.query(Quote).filter(Quote.vendor_id == vendor_id).count()
        
        # 3. Acceptance Rate
        total_quotes = active_quotes_count
        won_quotes = db.query(Quote).filter(Quote.vendor_id == vendor_id, Quote.is_winner == True).count()
        
        acceptance_rate = 0
        if total_quotes > 0:
            acceptance_rate = int((won_quotes / total_quotes) * 100)
        
        return {
            "new_rfqs": new_rfqs_count,
            "active_quotes": active_quotes_count,
            "acceptance_rate": acceptance_rate,
            "new_rfqs_change": "+2 today",
            "active_quotes_expire": "1 expiring"
        }
    except Exception as e:
        import traceback
        return {
            "error": str(e),
            "traceback": traceback.format_exc(),
            "new_rfqs": 0,
            "active_quotes": 0,
            "acceptance_rate": 0,
            "new_rfqs_change": "Error",
            "active_quotes_expire": "Error"
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
