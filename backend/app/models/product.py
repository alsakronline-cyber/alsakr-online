from sqlalchemy import Column, String, Text, JSON, DateTime
from datetime import datetime
from app.database import Base

class Product(Base):
    __tablename__ = "products"

    sku_id = Column(String, primary_key=True, index=True)
    product_name = Column(String)
    category = Column(String, nullable=True)
    family_group = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    specifications = Column(JSON, nullable=True)
    images = Column(JSON, nullable=True)
    technical_drawings = Column(JSON, nullable=True)
    documents = Column(JSON, nullable=True)
    custom_data = Column(JSON, nullable=True)
    datasheet_url = Column(String, nullable=True)
    source = Column(String, default="SICK")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
