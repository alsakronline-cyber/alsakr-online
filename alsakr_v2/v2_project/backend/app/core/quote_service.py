from typing import List, Dict, Optional, Any
import httpx
from pydantic import BaseModel
import os
from datetime import datetime
import asyncio
from app.core.email_service import email_service

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
                    "status": "pending"
                }
                
                if quote.valid_until:
                    payload["valid_until"] = quote.valid_until
                if quote.notes:
                    payload["notes"] = quote.notes

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

                # Send Notification (Fire & Forget)
                # TODO: We need Buyer Email. Inquiry Service has it.
                # For now, we skip or assume Inquiry Object has it?
                # Ideally we fetch inquiry first.
                # Let's add a quick fetch to get buyer ID details if needed, 
                # but 'send_quote_notification' implementation in email_service was empty/pass.
                # So we just place the hook here for now.
                asyncio.create_task(email_service.send_quote_notification(quote_record))

                return quote_record
            except Exception as e:
                print(f"Error creating quote: {e}")
                raise e

    async def get_quotes_for_inquiry(self, inquiry_id: str) -> List[Dict]:
        """Get all quotes associated with a specific inquiry."""
        async with httpx.AsyncClient() as client:
            try:
                # Use exact pattern from inquiry_service which works
                filter_query = f"inquiry_id='{inquiry_id}'"
                response = await client.get(
                    f"{self.pb_url}/api/collections/{self.collection}/records?filter={filter_query}&sort=-created",
                    timeout=5.0
                )
                try:
                    response.raise_for_status()
                except Exception as e:
                    print(f"Error Status: {response.status_code}")
                    print(f"Error Body: {response.text}")
                    raise e
                    
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
                data = response.json()
                
                # Notify Vendor (Admin)
                if status in ['accepted', 'rejected']:
                    asyncio.create_task(email_service.send_quote_status_notification(data, status))

                return data
            except Exception as e:
                print(f"Error updating quote status: {e}")
                raise e
