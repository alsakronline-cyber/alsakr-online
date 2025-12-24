"""
Database models for scraper system

Models:
- ScraperJob: Tracks scraping job execution and status
- ScrapedProduct: Stores scraped product data with deduplication
"""

from sqlalchemy import Column, Integer, String, Text, JSON, DateTime, Index
from datetime import datetime
from app.database import Base


class ScraperJob(Base):
    """
    Tracks scraper job execution
    
    Stores job metadata for monitoring and debugging:
    - Job status (queued, running, completed, failed)
    - Record counts (extracted, saved, rejected)
    - Timing information
    - Error messages
    """
    __tablename__ = "scraper_jobs"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    scraper_id = Column(String(255), nullable=False, index=True)
    status = Column(String(50), nullable=False)  # queued, running, completed, failed
    records_extracted = Column(Integer, default=0)
    records_saved = Column(Integer, default=0)
    records_rejected = Column(Integer, default=0)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        Index('idx_scraper_jobs_status', 'status'),
        Index('idx_scraper_jobs_started', 'started_at'),
        Index('idx_scraper_jobs_scraper_id', 'scraper_id'),
    )
    
    def __repr__(self):
        return f"<ScraperJob(id={self.id}, scraper_id='{self.scraper_id}', status='{self.status}')>"


class ScrapedProduct(Base):
    """
    Stores scraped product data
    
    Features:
    - Deduplication via data_hash (MD5 of vendor+part_number)
    - JSON storage for flexible specifications
    - Track scraping timestamps
    - Support for multiple images and PDFs
    """
    __tablename__ = "scraped_products"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    scraper_id = Column(String(255), nullable=False, index=True)
    vendor_name = Column(String(255), nullable=False, index=True)
    part_number = Column(String(255), nullable=False, index=True)
    product_name = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(255), nullable=True, index=True)
    specifications = Column(JSON, nullable=True)  # Key-value pairs of technical specs
    image_urls = Column(JSON, nullable=True)  # Array of image URLs
    pdf_urls = Column(JSON, nullable=True)  # Array of PDF/datasheet URLs
    source_url = Column(String(1000), nullable=True)
    data_hash = Column(String(32), unique=True, nullable=False, index=True)  # MD5 for deduplication
    scraped_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    __table_args__ = (
        Index('idx_scraped_products_vendor', 'vendor_name'),
        Index('idx_scraped_products_part', 'part_number'),
        Index('idx_scraped_products_hash', 'data_hash'),
        Index('idx_scraped_products_category', 'category'),
    )
    
    def __repr__(self):
        return f"<ScrapedProduct(id={self.id}, vendor='{self.vendor_name}', part='{self.part_number}')>"
