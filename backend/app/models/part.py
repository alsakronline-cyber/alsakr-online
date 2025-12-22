from sqlalchemy import Column, String, Text, JSON, DateTime, Boolean
from app.database import Base
import uuid
import datetime

def generate_uuid():
    return str(uuid.uuid4())

class Part(Base):
    __tablename__ = "parts"

    id = Column(String, primary_key=True, default=generate_uuid)
    part_number = Column(String, index=True)
    manufacturer = Column(String, index=True)
    category = Column(String)
    subcategory = Column(String)
    description_en = Column(Text)
    description_ar = Column(Text)
    technical_specs = Column(JSON)  # Stores detailed specs as JSON
    image_url = Column(String)
    datasheet_url = Column(String)
    status = Column(String, default="active")  # active, discontinued
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    scraped_at = Column(DateTime, default=datetime.datetime.utcnow)
