from sqlalchemy import Column, String, Float, DateTime, Text, ForeignKey, JSON, Integer
from app.database import Base
import uuid
import datetime

def generate_uuid():
    return str(uuid.uuid4())

class Order(Base):
    """Purchase order from accepted quote"""
    __tablename__ = "orders"

    id = Column(String, primary_key=True, default=generate_uuid)
    quote_id = Column(String, ForeignKey("quotes.id"))
    buyer_id = Column(String, ForeignKey("users.id"))
    vendor_id = Column(String, ForeignKey("users.id"))
    total_amount = Column(Float)
    currency = Column(String, default="USD")
    status = Column(String, default="pending")  # pending, confirmed, shipped, delivered, cancelled
    shipping_address = Column(Text, nullable=True)
    tracking_number = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    estimated_delivery = Column(DateTime, nullable=True)
