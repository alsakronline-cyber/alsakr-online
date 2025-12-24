"""
Data validation pipeline with Pydantic and deduplication

Handles:
- Schema validation for scraped products
- MD5 hash-based deduplication
- Database persistence with conflict resolution
- Rejected records tracking
"""

from pydantic import BaseModel, field_validator, ValidationError
from typing import List, Dict, Optional
import hashlib
import json
from sqlalchemy.orm import Session
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class ProductData(BaseModel):
    """Validated product data model"""
    vendor_name: str
    part_number: str
    product_name: str
    description: Optional[str] = None
    category: Optional[str] = None
    specifications: Dict[str, str] = {}
    image_urls: List[str] = []
    pdf_urls: List[str] = []
    source_url: str
    
    @field_validator('part_number')
    @classmethod
    def validate_part_number(cls, v):
        """Ensure part number is valid"""
        if not v or len(v) < 2:
            raise ValueError('Part number too short or empty')
        return v.strip().upper()
    
    @field_validator('product_name')
    @classmethod
    def validate_product_name(cls, v):
        """Ensure product name exists"""
        if not v or len(v) < 3:
            raise ValueError('Product name too short or empty')
        return v.strip()
    
    def generate_hash(self) -> str:
        """
        Generate MD5 hash for deduplication
        
        Hash is based on vendor_name + part_number
        This ensures same product from same vendor has consistent hash
        """
        data_str = json.dumps({
            'vendor': self.vendor_name,
            'part': self.part_number
        }, sort_keys=True)
        return hashlib.md5(data_str.encode()).hexdigest()


async def validate_and_save_products(
    raw_products: List[Dict],
    scraper_id: str,
    vendor_name: str,
    db: Session
) -> Dict[str, int]:
    """
    Validate scraped data, deduplicate, and persist to database
    
    Process:
    1. Validate each product with Pydantic schema
    2. Generate deduplication hash
    3. Check if product exists (by hash)
    4. Insert new or update existing
    5. Track rejected records for debugging
    
    Args:
        raw_products: List of raw product dictionaries from scraper
        scraper_id: ID of scraper that generated the data
        vendor_name: Vendor name for the products
        db: SQLAlchemy database session
    
    Returns:
        Dictionary with counts: {'saved': int, 'rejected': int, 'rejected_records': [...]}
    """
    from app.db.models import ScrapedProduct
    
    saved_count = 0
    updated_count = 0
    rejected_count = 0
    rejected_records = []
    
    logger.info(f"Validating {len(raw_products)} products for {vendor_name}")
    
    for idx, raw_product in enumerate(raw_products):
        try:
            # Validate with Pydantic
            product = ProductData(
                vendor_name=vendor_name,
                **raw_product
            )
            
            # Generate deduplication hash
            data_hash = product.generate_hash()
            
            # Check if exists
            existing = db.query(ScrapedProduct).filter_by(
                data_hash=data_hash
            ).first()
            
            if existing:
                # Update if specifications or other fields changed
                updated = False
                
                if existing.specifications != product.specifications:
                    existing.specifications = product.specifications
                    updated = True
                
                if existing.product_name != product.product_name:
                    existing.product_name = product.product_name
                    updated = True
                
                if existing.image_urls != product.image_urls:
                    existing.image_urls = product.image_urls
                    updated = True
                
                if existing.pdf_urls != product.pdf_urls:
                    existing.pdf_urls = product.pdf_urls
                    updated = True
                
                if updated:
                    existing.updated_at = datetime.utcnow()
                    updated_count += 1
                    logger.debug(f"Updated existing product: {product.part_number}")
            
            else:
                # Insert new product
                new_product = ScrapedProduct(
                    scraper_id=scraper_id,
                    vendor_name=product.vendor_name,
                    part_number=product.part_number,
                    product_name=product.product_name,
                    description=product.description,
                    category=product.category,
                    specifications=product.specifications,
                    image_urls=product.image_urls,
                    pdf_urls=product.pdf_urls,
                    source_url=product.source_url,
                    data_hash=data_hash,
                    scraped_at=datetime.utcnow()
                )
                db.add(new_product)
                saved_count += 1
                logger.debug(f"Inserted new product: {product.part_number}")
        
        except ValidationError as e:
            # Validation failed - track for debugging
            rejected_count += 1
            rejected_records.append({
                'row_index': idx,
                'error': str(e),
                'data': raw_product
            })
            logger.warning(f"Validation failed for row {idx}: {e}")
        
        except Exception as e:
            # Unexpected error - track for debugging
            rejected_count += 1
            rejected_records.append({
                'row_index': idx,
                'error': f"Unexpected error: {str(e)}",
                'data': raw_product
            })
            logger.error(f"Unexpected error processing row {idx}: {e}", exc_info=True)
    
    # Commit transaction
    try:
        db.commit()
        logger.info(f"Database transaction committed: {saved_count} new, {updated_count} updated, {rejected_count} rejected")
    except Exception as e:
        db.rollback()
        logger.error(f"Database commit failed: {e}", exc_info=True)
        raise
    
    return {
        'saved': saved_count,
        'updated': updated_count,
        'rejected': rejected_count,
        'rejected_records': rejected_records[:10]  # First 10 for debugging
    }
