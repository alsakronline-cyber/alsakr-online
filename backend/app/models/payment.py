from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
import uuid
import datetime

def generate_uuid():
    return str(uuid.uuid4())

class Payment(Base):
    """Payment transaction for an order"""
    __tablename__ = "payments"

    id = Column(String, primary_key=True, default=generate_uuid)
    order_id = Column(String, ForeignKey("orders.id"), nullable=False, unique=True)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="USD")
    provider = Column(String, nullable=False)  # stripe, tap, khazna
    status = Column(String, default="pending")  # pending, completed, failed, refunded
    transaction_id = Column(String, nullable=True)  # External ID from provider
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    # order relationship is defined in Order model
