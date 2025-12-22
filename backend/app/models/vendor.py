from sqlalchemy import Column, String, Float, DateTime
from app.database import Base
import uuid
import datetime

def generate_uuid():
    return str(uuid.uuid4())

class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(String, primary_key=True, default=generate_uuid)
    company_name = Column(String, index=True)
    contact_email = Column(String)
    country = Column(String)
    response_rate = Column(Float, default=0.0)
    avg_quote_time = Column(String)  # e.g., "2 hours"
    reliability_score = Column(Float, default=5.0)  # 0 to 10
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
