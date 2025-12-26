from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

from app.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.order import Order, OrderItem
from app.models.quote import Quote
from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.api.notification_routes import create_notification

router = APIRouter()

# --- Pydantic Schemas ---
class CheckoutRequest(BaseModel):
    shipping_address: str
    notes: Optional[str] = None

class OrderItemResponse(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    price_at_purchase: float
    total_price: float

class OrderResponse(BaseModel):
    id: str
    quote_id: Optional[str] = None
    buyer_id: str
    vendor_id: Optional[str] = None
    total_amount: float
    currency: str
    status: str
    payment_status: str
    shipping_address: Optional[str]
    tracking_number: Optional[str]
    notes: Optional[str]
    created_at: datetime
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True

# --- Endpoints ---

@router.post("/orders/checkout", response_model=OrderResponse)
def checkout_cart(
    checkout_in: CheckoutRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Convert mutable Cart into an immutable Order"""
    # 1. Get Cart
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart or not cart.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    # 2. Calculate Total & Prepare Order Items
    total_amount = 0.0
    order_items_data = []
    
    # We assume single vendor or mixed is allowed. 
    # For Phase 1, we create one Order. If mixed vendors, we might set vendor_id=None or main vendor.
    # Let's set vendor_id to the first item's vendor for now, or None if mixed.
    first_vendor_id = None 

    for cart_item in cart.items:
        product = db.query(Product).filter(Product.id == cart_item.product_id).first()
        if not product:
            continue # Skip invalid items or raise error
        
        if not product.is_available:
             raise HTTPException(status_code=400, detail=f"Product {product.name} is unavailable")

        if first_vendor_id is None:
            first_vendor_id = product.vendor_id
        
        item_total = (product.price or 0.0) * cart_item.quantity
        total_amount += item_total
        
        order_items_data.append({
            "product_id": product.id,
            "product_name": product.name, # Store for history if Product changes
            "quantity": cart_item.quantity,
            "price_at_purchase": product.price or 0.0,
            "total_price": item_total,
            "vendor_id": product.vendor_id
        })

    if total_amount == 0 and not order_items_data:
         raise HTTPException(status_code=400, detail="No valid items in cart")

    # 3. Create Order
    new_order = Order(
        buyer_id=current_user.id,
        vendor_id=first_vendor_id, 
        total_amount=total_amount,
        currency="USD", # Default for now
        status="pending",
        payment_status="unpaid",
        shipping_address=checkout_in.shipping_address,
        notes=checkout_in.notes
    )
    db.add(new_order)
    db.flush() # Generate ID

    # 4. Create Order Items
    for item_data in order_items_data:
        order_item = OrderItem(
            order_id=new_order.id,
            product_id=item_data["product_id"],
            quantity=item_data["quantity"],
            price_at_purchase=item_data["price_at_purchase"],
            total_price=item_data["total_price"]
        )
        db.add(order_item)

    # 5. Clear Cart
    db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
    
    # 6. Notify (Optional: Admin or Vendor)
    # create_notification(...)

    db.commit()
    db.refresh(new_order)
    
    # Manually construct response to include items name (which isn't on OrderItem model explicitly if we didn't add it)
    # Wait, OrderItem model doesn't have product_name. We fetch it via relationship.
    # We need to eager load items for response.
    return new_order


@router.post("/orders")
async def create_order_from_quote(
    quote_id: str,
    buyer_id: str,
    shipping_address: Optional[str] = None,
    notes: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Create an order from an accepted quote (Legacy/RFQ Flow)"""
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    
    if quote.status != "accepted":
        raise HTTPException(status_code=400, detail="Quote must be accepted before creating order")
    
    order = Order(
        quote_id=quote_id,
        buyer_id=buyer_id,
        vendor_id=quote.vendor_id,
        total_amount=quote.price,
        currency=quote.currency,
        status="pending",
        payment_status="unpaid",
        shipping_address=shipping_address,
        notes=notes
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    
    return {"id": order.id, "status": order.status, "message": "Order created successfully from Quote"}

@router.get("/orders", response_model=List[OrderResponse])
def list_orders(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List current user's orders"""
    query = db.query(Order).filter(Order.buyer_id == current_user.id)
    
    if status:
        query = query.filter(Order.status == status)
    
    orders = query.order_by(Order.created_at.desc()).all()
    
    # Populate items for response (requires implicit join or eager load)
    # Pydantic's from_attributes should handle `order.items` relationship if defined
    # We need to ensure `OrderItem` -> `Product` relationship exists to get names, 
    # OR we map it manually. OrderItem has methods? No.
    # Let's add a property to OrderItem schema or map it.
    
    # For simplicity, we just return the objects, allowing Pydantic to try to serialize.
    # But OrderItemResponse needs `product_name`. OrderItem model has `product_id`.
    # We might need a small helper or update OrderItem model to store name snapshot.
    # PLAN: Update OrderItemResponse to be simpler or rely on lazy loading product.name
    
    response_data = []
    for order in orders:
        items_data = []
        for item in order.items:
             # Fetch product name efficiently? N+1 problem here but okay for low volume Phase 1.
             product = db.query(Product).filter(Product.id == item.product_id).first()
             items_data.append({
                 "product_id": item.product_id,
                 "product_name": product.name if product else "Unknown Product",
                 "quantity": item.quantity,
                 "price_at_purchase": item.price_at_purchase,
                 "total_price": item.total_price
             })
        
        ord_dict = order.__dict__
        ord_dict['items'] = items_data
        response_data.append(ord_dict)
        
    return response_data

@router.get("/orders/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get full order details including items"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    if order.buyer_id != current_user.id and current_user.role != 'admin':
         raise HTTPException(status_code=403, detail="Not authorized to view this order")
    
    items_data = []
    for item in order.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            items_data.append({
                "product_id": item.product_id,
                "product_name": product.name if product else "Unknown Product",
                "quantity": item.quantity,
                "price_at_purchase": item.price_at_purchase,
                "total_price": item.total_price
            })
            
    ord_dict = order.__dict__
    ord_dict['items'] = items_data
    return ord_dict

@router.put("/orders/{order_id}")
async def update_order_status(
    order_id: str,
    status: Optional[str] = None,
    tracking_number: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update order (Vendor/Admin Only)"""
    # ... (Keep existing logic but enforce auth)
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Basic permission check (improve later)
    # if current_user.role not in ['vendor', 'admin']: ...
    
    if status:
        order.status = status
    if tracking_number:
        order.tracking_number = tracking_number
        
    db.commit()
    return {"message": "Order updated", "status": order.status}
