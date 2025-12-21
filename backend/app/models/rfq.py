from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.database import Base

class RFQ(Base):
    __tablename__ = "rfqs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    part_number = Column(String, index=True)
    quantity = Column(Integer)
    status = Column(String, default="draft")
    created_at = Column(DateTime, default=datetime.utcnow)

    quotes = relationship("Quote", back_populates="rfq")

class Quote(Base):
    __tablename__ = "quotes"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    rfq_id = Column(String, ForeignKey("rfqs.id"))
    vendor_name = Column(String)
    price = Column(Float)
    currency = Column(String)
    lead_time_days = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

    rfq = relationship("RFQ", back_populates="quotes")
