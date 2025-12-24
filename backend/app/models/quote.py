from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database import Base
import uuid
import datetime

def generate_uuid():
    return str(uuid.uuid4())

class Quote(Base):
    __tablename__ = "quotes"

    id = Column(String, primary_key=True, default=generate_uuid)
    inquiry_id = Column(String, ForeignKey("inquiries.id"))
    vendor_id = Column(String, ForeignKey("vendors.id"))
    
    price = Column(Float)
    currency = Column(String, default="USD")
    lead_time = Column(String) # e.g., "2 weeks"
    availability = Column(String) # e.g., "In Stock"
    shipping_cost = Column(Float, default=0.0)
    
    is_winner = Column(Boolean, default=False)
    notes = Column(String, nullable=True) # Vendor comments
    raw_email_content = Column(String, nullable=True) # For debug/audit
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    inquiry = relationship("Inquiry", back_populates="quotes")
    vendor = relationship("Vendor", back_populates="quotes")
