from abc import ABC, abstractmethod
from sqlalchemy.orm import Session
from app.models.part import Part
import time
import random
import asyncio
from datetime import datetime

class BaseScraper(ABC):
    def __init__(self, brand_name: str, base_url: str, db: Session):
        self.brand_name = brand_name
        self.base_url = base_url
        self.db = db
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }

    @abstractmethod
    async def scrape_catalog(self):
        """Main orchestration method to be implemented by child classes."""
        pass

    @abstractmethod
    async def extract_part_details(self, product_url: str) -> dict:
        """Extract details for a single part."""
        pass

    async def save_to_database(self, part_data: dict):
        """Insert or update part in the database."""
        try:
            part = self.db.query(Part).filter(Part.part_number == part_data["part_number"]).first()
            if part:
                # Update existing part
                for key, value in part_data.items():
                    setattr(part, key, value)
                part.scraped_at = datetime.utcnow()
            else:
                # Create new part
                part = Part(**part_data)
                self.db.add(part)
            
            self.db.commit()
            print(f"[{self.brand_name}] Saved part: {part_data.get('part_number')}")
        except Exception as e:
            self.db.rollback()
            print(f"[{self.brand_name}] Error saving part: {e}")

    async def handle_rate_limiting(self):
        """Sleep for random interval (2-5 seconds)."""
        delay = random.uniform(2.0, 5.0)
        await asyncio.sleep(delay)

    def validate_part_number(self, part_num: str) -> bool:
        """Basic validation."""
        if not part_num or len(part_num) < 3:
            return False
        return True
