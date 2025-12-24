from sqlalchemy import Column, String, Integer, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
import uuid
import datetime

def generate_uuid():
    return str(uuid.uuid4())

class Inquiry(Base):
    __tablename__ = "inquiries"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"))
    part_id = Column(String, ForeignKey("parts.id"))
    status = Column(String, default="pending")  # pending, quoted, closed
    quantity = Column(Integer)
    urgency_level = Column(String)  # low, medium, high
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User")
    part = relationship("Part")
