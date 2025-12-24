from sqlalchemy import Column, String, Integer, Float, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base
import uuid
import datetime

def generate_uuid():
    return str(uuid.uuid4())

class RFQ(Base):
    """Request for Quotation model"""
    __tablename__ = "rfqs"

    id = Column(String, primary_key=True, default=generate_uuid)
    buyer_id = Column(String, ForeignKey("users.id"))
    title = Column(String)
    description = Column(Text)
    part_description = Column(Text)
    quantity = Column(Integer)
    target_price = Column(Float, nullable=True)
    requirements = Column(Text, nullable=True)
    status = Column(String, default="open")  # open, quoted, closed, cancelled
    attachments = Column(JSON, nullable=True)  # List of file URLs
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    deadline = Column(DateTime, nullable=True)

    # Relationships
    quotes = relationship("Quote", back_populates="rfq")
