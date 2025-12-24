from sqlalchemy import Column, String, Boolean, DateTime
from app.database import Base
import uuid
import datetime

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    full_name = Column(String)
    company_name = Column(String)
    role = Column(String, default="buyer")  # buyer, vendor, both
    industry_type = Column(String)
    phone_number = Column(String)
    preferred_language = Column(String, default="en")  # en or ar
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

