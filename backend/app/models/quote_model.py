from sqlalchemy import Column, String, Float, DateTime, Text, ForeignKey, JSON
from app.database import Base
import uuid
import datetime

def generate_uuid():
    return str(uuid.uuid4())

class Quote(Base):
    """Vendor quote in response to RFQ"""
    __tablename__ = "quotes"

    id = Column(String, primary_key=True, default=generate_uuid)
    rfq_id = Column(String, ForeignKey("rfqs.id"))
    vendor_id = Column(String, ForeignKey("users.id"))
    price = Column(Float)
    currency = Column(String, default="USD")
    delivery_time = Column(String)  # e.g., "2 weeks", "30 days"
    notes = Column(Text, nullable=True)
    attachments = Column(JSON, nullable=True)
    status = Column(String, default="pending")  # pending, accepted, rejected, expired
    valid_until = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
