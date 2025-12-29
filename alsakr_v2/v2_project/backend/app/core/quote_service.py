from typing import List, Dict, Optional, Any
import httpx
from pydantic import BaseModel
import os
from datetime import datetime

class QuoteCreate(BaseModel):
    inquiry_id: str
    vendor_id: str
    items: List[Dict[str, Any]]  # items with price, lead_time
    total_price: float
    currency: str = "USD"
    valid_until: Optional[str] = None
    notes: Optional[str] = None

class QuoteService:
    def __init__(self):
        self.pb_url = os.getenv("PB_URL", "http://pocketbase:8090")
        self.collection = "quotations"

    async def create_quote(self, quote: QuoteCreate) -> Dict:
        """Create a new quotation for an inquiry."""
        async with httpx.AsyncClient() as client:
            try:
                payload = {
                    "inquiry_id": quote.inquiry_id,
                    "vendor_id": quote.vendor_id,
                    "items": quote.items,
                    "total_price": quote.total_price,
                    "currency": quote.currency,
                    "valid_until": quote.valid_until,
                    "notes": quote.notes,
                    "status": "pending"
                }

                # Create the quote
                response = await client.post(
                    f"{self.pb_url}/api/collections/{self.collection}/records",
                    json=payload,
                    timeout=5.0
                )
                response.raise_for_status()
                quote_record = response.json()

                # Update inquiry status to 'quoted'
                # We need to find the inquiry service or just do it raw here for now to avoid circular deps
                # Just doing a raw update to inquiry collection
                await client.patch(
                    f"{self.pb_url}/api/collections/inquiries/records/{quote.inquiry_id}",
                    json={"status": "quoted"},
                    timeout=5.0
                )

                return quote_record
            except Exception as e:
                print(f"Error creating quote: {e}")
                raise e

    async def get_quotes_for_inquiry(self, inquiry_id: str) -> List[Dict]:
        """Get all quotes associated with a specific inquiry."""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.pb_url}/api/collections/{self.collection}/records?filter=(inquiry_id='{inquiry_id}')&sort=-created",
                    timeout=5.0
                )
                response.raise_for_status()
                data = response.json()
                return data.get("items", [])
            except Exception as e:
                print(f"Error fetching quotes: {e}")
                return []

    async def update_quote_status(self, quote_id: str, status: str) -> Dict:
        """Update the status of a quote (e.g., accepted, rejected)."""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.patch(
                    f"{self.pb_url}/api/collections/{self.collection}/records/{quote_id}",
                    json={"status": status},
                    timeout=5.0
                )
                response.raise_for_status()
                return response.json()
            except Exception as e:
                print(f"Error updating quote status: {e}")
                raise e
