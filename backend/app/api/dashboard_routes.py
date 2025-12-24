from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.rfq import RFQ
from app.models.quote import Quote
import socket

router = APIRouter()

@router.get("/vendor/{vendor_id}/stats")
def get_vendor_stats(vendor_id: str, db: Session = Depends(get_db)):
    try:
        # 1. Active RFQs (RFQs open)
        new_rfqs_count = db.query(RFQ).filter(RFQ.status == "open").count()
        
        # 2. Active Quotations (Quotes submitted by this vendor)
        active_quotes_count = db.query(Quote).filter(Quote.vendor_id == vendor_id).count()
        
        # 3. Acceptance Rate & Revenue
        accepted_quotes = db.query(Quote).filter(Quote.vendor_id == vendor_id, Quote.status == "accepted").all()
        won_quotes_count = len(accepted_quotes)
        total_revenue = sum(q.price for q in accepted_quotes)
        
        acceptance_rate = 0
        if active_quotes_count > 0:
            acceptance_rate = int((won_quotes_count / active_quotes_count) * 100)
        
        return {
            "new_rfqs": new_rfqs_count,
            "active_quotes": active_quotes_count,
            "acceptance_rate": acceptance_rate,
            "total_revenue": total_revenue,
            "currency": "USD",
            "new_rfqs_change": f"+{new_rfqs_count} open",
            "active_quotes_expire": "Active tracking"
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

@router.get("/vendor/{vendor_id}/rfqs")
def get_vendor_rfqs(vendor_id: str, db: Session = Depends(get_db)):
    """
    Returns list of RFQs that are relevant to this vendor.
    """
    # Return all open RFQs
    rfqs = db.query(RFQ).filter(RFQ.status != "closed").order_by(RFQ.created_at.desc()).limit(10).all()
    
    result = []
    for rfq in rfqs:
        # Check if this vendor has already quoted
        has_quoted = db.query(Quote).filter(Quote.rfq_id == rfq.id, Quote.vendor_id == vendor_id).first()
        
        result.append({
            "id": rfq.id,
            "title": rfq.title,
            "description": rfq.description or "No description",
            "quantity": rfq.quantity,
            "status": "Quoted" if has_quoted else "New",
            "created_at": rfq.created_at.isoformat() if rfq.created_at else None
        })
        
    return result
