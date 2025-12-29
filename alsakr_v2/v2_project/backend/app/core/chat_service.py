from typing import List, Dict, Optional, Any
import httpx
from pydantic import BaseModel
import os

class MessageCreate(BaseModel):
    inquiry_id: str
    sender_id: str  # User ID of the sender
    sender_role: str  # 'buyer' or 'vendor'
    content: str

class ChatService:
    def __init__(self):
        self.pb_url = os.getenv("PB_URL", "http://pocketbase:8090")
        self.collection = "messages"

    async def send_message(self, message: MessageCreate) -> Dict:
        """Send a new message in a chat thread."""
        async with httpx.AsyncClient() as client:
            try:
                payload = {
                    "inquiry_id": message.inquiry_id,
                    "sender_id": message.sender_id,
                    "sender_role": message.sender_role,
                    "content": message.content,
                    "read": False
                }

                response = await client.post(
                    f"{self.pb_url}/api/collections/{self.collection}/records",
                    json=payload,
                    timeout=5.0
                )
                response.raise_for_status()
                return response.json()
            except Exception as e:
                print(f"Error sending message: {e}")
                raise e

    async def get_messages(self, inquiry_id: str) -> List[Dict]:
        """Get message history for an inquiry."""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.pb_url}/api/collections/{self.collection}/records?filter=(inquiry_id='{inquiry_id}')&sort=created",
                    timeout=5.0
                )
                response.raise_for_status()
                data = response.json()
                return data.get("items", [])
            except Exception as e:
                print(f"Error fetching messages: {e}")
                return []
