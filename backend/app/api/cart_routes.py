from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.cart import Cart, CartItem
from app.models.product import Product
from pydantic import BaseModel, UUID4

router = APIRouter()

# --- Pydantic Schemas ---
class CartItemCreate(BaseModel):
    product_id: str  # Assuming UUID string
    quantity: int = 1

class CartItemUpdate(BaseModel):
    quantity: int

class CartItemResponse(BaseModel):
    id: str
    product_id: str
    quantity: int
    product_name: str
    price: float
    image_url: str | None = None
    
    class Config:
        from_attributes = True

class CartResponse(BaseModel):
    id: str
    items: List[CartItemResponse]
    total_price: float
    
    class Config:
        from_attributes = True

# --- Endpoints ---

@router.get("/cart", response_model=CartResponse)
def get_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get the current user's cart. Create one if it doesn't exist."""
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart:
        cart = Cart(user_id=current_user.id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    
    # Enrich response with product details
    items_response = []
    total_price = 0.0
    
    for item in cart.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            item_total = (product.price or 0.0) * item.quantity
            total_price += item_total
            items_response.append(CartItemResponse(
                id=item.id,
                product_id=item.product_id,
                quantity=item.quantity,
                product_name=product.name,
                price=product.price or 0.0,
                image_url=product.images[0] if product.images and len(product.images) > 0 else None
            ))
            
    return CartResponse(id=cart.id, items=items_response, total_price=total_price)


@router.post("/cart/items", response_model=CartResponse)
def add_to_cart(
    item_in: CartItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add an item to the cart or update quantity if it exists"""
    # 1. Get or Create Cart
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart:
        cart = Cart(user_id=current_user.id)
        db.add(cart)
        db.commit()
        db.refresh(cart)

    # 2. Check Product existence
    product = db.query(Product).filter(Product.id == item_in.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # 3. Check if item already in cart
    existing_item = db.query(CartItem).filter(
        CartItem.cart_id == cart.id,
        CartItem.product_id == item_in.product_id
    ).first()

    if existing_item:
        existing_item.quantity += item_in.quantity
    else:
        new_item = CartItem(
            cart_id=cart.id,
            product_id=item_in.product_id,
            quantity=item_in.quantity
        )
        db.add(new_item)
    
    db.commit()
    return get_cart(db, current_user)


@router.put("/cart/items/{item_id}", response_model=CartResponse)
def update_cart_item(
    item_id: str,
    item_in: CartItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update quantity of a specific cart item"""
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.cart_id == cart.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found in cart")

    if item_in.quantity <= 0:
        db.delete(item)
    else:
        item.quantity = item_in.quantity
    
    db.commit()
    return get_cart(db, current_user)


@router.delete("/cart/items/{item_id}", response_model=CartResponse)
def remove_cart_item(
    item_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove an item from the cart"""
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.cart_id == cart.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    db.delete(item)
    db.commit()
    return get_cart(db, current_user)

@router.delete("/cart", status_code=status.HTTP_204_NO_CONTENT)
def clear_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Clear all items from the cart"""
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if cart:
        db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
        db.commit()
    return None
