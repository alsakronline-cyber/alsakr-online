from typing import List, Dict, Optional, Any
import httpx
from pydantic import BaseModel
import os

# Pydantic schema for creating an inquiry
class InquiryCreate(BaseModel):
    buyer_id: str
    products: List[Dict[str, Any]] # List of product details (part_number, name, etc.)
    message: str

class InquiryService:
    def __init__(self):
        # Fallback to localhost if env var not set, for local dev
        self.pb_url = os.getenv("PB_URL", "http://pocketbase:8090") 
        self.collection = "inquiries"

    async def create_inquiry(self, inquiry: InquiryCreate) -> Dict:
        """Creates a new inquiry record in PocketBase."""
        async with httpx.AsyncClient() as client:
            try:
                # We assume the collection 'inquiries' exists. 
                # In a real scenario, we might auth as admin, but for now we'll allow public create
                # or assume the API server is within the trust boundary if using admin token.
                # For simplicity in this demo phase, we'll try public create.
                
                payload = {
                    "buyer_id": inquiry.buyer_id,
                    "products": inquiry.products, # PocketBase handles JSON fields
                    "message": inquiry.message,
                    "status": "pending"
                }
                
                response = await client.post(
                    f"{self.pb_url}/api/collections/{self.collection}/records",
                    json=payload,
                    timeout=5.0
                )
                response.raise_for_status()
                return response.json()
            except Exception as e:
                print(f"Error creating inquiry: {e}")
                raise e

    async def get_vendor_inquiries(self) -> List[Dict]:
        """Fetches all inquiries for the vendor dashboard."""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.pb_url}/api/collections/{self.collection}/records?sort=-created",
                    timeout=5.0
                )
                response.raise_for_status()
                data = response.json()
                return data.get("items", [])
            except Exception as e:
                print(f"Error fetching inquiries: {e}")
                return []
