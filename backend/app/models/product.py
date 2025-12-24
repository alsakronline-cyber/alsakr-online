from sqlalchemy import Column, String, Float, DateTime, Text, ForeignKey, JSON, Integer, Boolean
from app.database import Base
import uuid
import datetime

def generate_uuid():
    return str(uuid.uuid4())

class Product(Base):
    """Vendor catalog product"""
    __tablename__ = "products"

    id = Column(String, primary_key=True, default=generate_uuid)
    vendor_id = Column(String, ForeignKey("users.id"))
    part_number = Column(String)
    name = Column(String)
    description = Column(Text)
    category = Column(String, nullable=True)
    manufacturer = Column(String, nullable=True)
    price = Column(Float, nullable=True)
    currency = Column(String, default="USD")
    stock_quantity = Column(Integer, default=0)
    is_available = Column(Boolean, default=True)
    specifications = Column(JSON, nullable=True)
    images = Column(JSON, nullable=True)  # List of image URLs
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
