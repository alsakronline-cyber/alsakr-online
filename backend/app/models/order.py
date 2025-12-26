from sqlalchemy import Column, String, Float, DateTime, Text, ForeignKey, JSON, Integer
from sqlalchemy.orm import relationship
from app.database import Base
import uuid
import datetime

def generate_uuid():
    return str(uuid.uuid4())

class Order(Base):
    """Purchase order from accepted quote or direct purchase"""
    __tablename__ = "orders"

    id = Column(String, primary_key=True, default=generate_uuid)
    quote_id = Column(String, ForeignKey("quotes.id"), nullable=True)
    buyer_id = Column(String, ForeignKey("users.id"))
    vendor_id = Column(String, ForeignKey("users.id"), nullable=True) # Optional for multi-vendor orders, logic needed if mixed
    total_amount = Column(Float)
    currency = Column(String, default="USD")
    status = Column(String, default="pending")  # pending, confirmed, shipped, delivered, cancelled
    payment_status = Column(String, default="unpaid") # unpaid, paid, refunded
    shipping_address = Column(Text, nullable=True)
    tracking_number = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    estimated_delivery = Column(DateTime, nullable=True)

    # Relationships
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    payment = relationship("Payment", backref="order", uselist=False)

class OrderItem(Base):
    """Individual item in an order"""
    __tablename__ = "order_items"

    id = Column(String, primary_key=True, default=generate_uuid)
    order_id = Column(String, ForeignKey("orders.id"), nullable=False)
    product_id = Column(String, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, default=1)
    price_at_purchase = Column(Float, nullable=False) # Snapshot of price
    total_price = Column(Float, nullable=False) # quantity * price_at_purchase

    # Relationships
    order = relationship("Order", back_populates="items")
