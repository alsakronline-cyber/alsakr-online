from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from pydantic import BaseModel

from app.database import get_db
from app.models.product import Product

router = APIRouter()

class ProductCreate(BaseModel):
    vendor_id: str
    part_number: str
    name: Optional[str] = None
    description: str
    price: Optional[float] = None
    category: Optional[str] = None
    manufacturer: Optional[str] = None
    stock_quantity: int = 0
    currency: Optional[str] = "USD"

@router.post("/catalog/products")
async def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db)
):
    """Add product to vendor catalog"""
    # Use part_number as name if name is missing
    product_name = product_data.name if product_data.name else product_data.part_number
    
    product = Product(
        vendor_id=product_data.vendor_id,
        part_number=product_data.part_number,
        name=product_name,
        description=product_data.description,
        category=product_data.category,
        manufacturer=product_data.manufacturer,
        price=product_data.price,
        currency=product_data.currency,
        stock_quantity=product_data.stock_quantity,
        is_available=True
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    
    return {"id": product.id, "message": "Product added to catalog"}

@router.get("/catalog/products")
async def list_products(
    vendor_id: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List products in catalog"""
    query = db.query(Product).filter(Product.is_available == True)
    
    if vendor_id:
        query = query.filter(Product.vendor_id == vendor_id)
    if category:
        query = query.filter(Product.category == category)
    
    products = query.all()
    
    return {
        "products": [
            {
                "id": prod.id,
                "vendor_id": prod.vendor_id,
                "part_number": prod.part_number,
                "name": prod.name,
                "description": prod.description,
                "price": prod.price,
                "stock_quantity": prod.stock_quantity,
                "manufacturer": prod.manufacturer
            }
            for prod in products
        ]
    }

@router.get("/catalog/products/{product_id}")
async def get_product(product_id: str, db: Session = Depends(get_db)):
    """Get product details"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {
        "id": product.id,
        "vendor_id": product.vendor_id,
        "part_number": product.part_number,
        "name": product.name,
        "description": product.description,
        "category": product.category,
        "manufacturer": product.manufacturer,
        "price": product.price,
        "stock_quantity": product.stock_quantity,
        "specifications": product.specifications
    }

@router.put("/catalog/products/{product_id}")
async def update_product(
    product_id: str,
    price: Optional[float] = None,
    stock_quantity: Optional[int] = None,
    is_available: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """Update product in catalog"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if price is not None:
        product.price = price
    if stock_quantity is not None:
        product.stock_quantity = stock_quantity
    if is_available is not None:
        product.is_available = is_available
    
    db.commit()
    return {"message": "Product updated successfully"}

@router.delete("/catalog/products/{product_id}")
async def delete_product(product_id: str, db: Session = Depends(get_db)):
    """Delete product from catalog"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product.is_available = False  # Soft delete
    db.commit()
    return {"message": "Product removed from catalog"}
