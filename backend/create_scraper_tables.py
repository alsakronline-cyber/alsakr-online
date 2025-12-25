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

# Handle existing tables that might miss columns (like 'accessories')
from sqlalchemy import text
with engine.connect() as conn:
    try:
        # Check if accessories column exists (SQLite/Postgres compatible check via error handling)
        conn.execute(text("SELECT accessories FROM scraped_products LIMIT 1"))
    except Exception:
        print("⚠️  Column 'accessories' missing in scraped_products. Adding it...")
        try:
            # Use JSON for the column type
            conn.execute(text("ALTER TABLE scraped_products ADD COLUMN accessories JSON"))
            conn.commit()
            print("✅ 'accessories', column added successfully!")
        except Exception as e:
            print(f"❌ Failed to add column: {e}")

print("✅ Scraper tables created successfully!")
print("Tables:")
print("  - scraper_jobs")
print("  - scraped_products")
