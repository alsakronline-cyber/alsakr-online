"""
Create scraper database tables

Run this inside the backend container to create scraper tables
"""

from app.database import engine, Base
from app.models.scraper import ScraperJob, ScrapedProduct

# Import models to register them with Base
print("Creating scraper database tables...")

# Create all tables
Base.metadata.create_all(bind=engine)

print("✅ Scraper tables created successfully!")
print("Tables:")
print("  - scraper_jobs")
print("  - scraped_products")
