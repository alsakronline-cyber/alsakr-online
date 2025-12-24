from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.rfq import RFQ
from app.models.quote import Quote
import datetime

router = APIRouter()

@router.get("/vendor/{vendor_id}/stats")
def get_vendor_stats(vendor_id: str, db: Session = Depends(get_db)):
    try:
        # 1. Active RFQs (RFQs open platform-wide)
        new_rfqs_count = db.query(RFQ).filter(RFQ.status == "open").count()
        
        # 2. Total Quotes by this vendor
        all_quotes = db.query(Quote).filter(Quote.vendor_id == vendor_id).all()
        active_quotes_count = len(all_quotes)
        
        # 3. Status Breakdown
        status_breakdown = {
            "pending": 0,
            "accepted": 0,
            "rejected": 0
        }
        for q in all_quotes:
            if q.status in status_breakdown:
                status_breakdown[q.status] += 1
        
        # 4. Total Revenue
        accepted_quotes = [q for q in all_quotes if q.status == "accepted"]
        total_revenue = sum(q.price for q in accepted_quotes)
        
        # 5. Acceptance Rate
        acceptance_rate = 0
        if active_quotes_count > 0:
            acceptance_rate = int((len(accepted_quotes) / active_quotes_count) * 100)
        
        # 6. Monthly Revenue Trend (Last 6 months)
        trends = []
        today = datetime.datetime.utcnow()
        for i in range(5, -1, -1):
            month_date = today - datetime.timedelta(days=i*30)
            month_name = month_date.strftime("%b")
            # This is a simplified fetch; in production use a group_by month query
            month_rev = sum(q.price for q in accepted_quotes if q.created_at.month == month_date.month and q.created_at.year == month_date.year)
            trends.append({"name": month_name, "revenue": month_rev})

        return {
            "new_rfqs": new_rfqs_count,
            "active_quotes": active_quotes_count,
            "acceptance_rate": acceptance_rate,
            "total_revenue": total_revenue,
            "currency": "USD",
            "status_breakdown": status_breakdown,
            "revenue_trend": trends,
            "new_rfqs_change": f"+{new_rfqs_count} open",
            "active_quotes_expire": "Active tracking"
        }
    except Exception as e:
        print(f"Error in vendor stats: {e}")
        return {
            "error": str(e),
            "new_rfqs": 0,
            "active_quotes": 0,
            "acceptance_rate": 0,
            "total_revenue": 0,
            "status_breakdown": {"pending": 0, "accepted": 0, "rejected": 0},
            "revenue_trend": []
        }

@router.get("/vendor/{vendor_id}/rfqs")
def get_vendor_rfqs(vendor_id: str, db: Session = Depends(get_db)):
    """
    Returns list of RFQs that are relevant to this vendor.
    """
    rfqs = db.query(RFQ).filter(RFQ.status != "closed").order_by(RFQ.created_at.desc()).limit(10).all()
    
    result = []
    for rfq in rfqs:
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


