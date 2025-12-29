import asyncio
import httpx
import json

PB_URL = "http://127.0.0.1:8090"
ADMIN_EMAIL = "admin@alsakronline.com"
ADMIN_PASSWORD = "#Anas231#Bkar3110"

async def main():
    print(f"Connecting to {PB_URL}...")
    
    async with httpx.AsyncClient() as client:
        # Auth
        try:
            resp = await client.post(f"{PB_URL}/api/collections/_superusers/auth-with-password", json={
                "identity": ADMIN_EMAIL, "password": ADMIN_PASSWORD
            })
            token = resp.json()["token"]
            headers = {"Authorization": token}
        except Exception as e:
            print(f"Auth failed: {e}")
            return

        # Check Quotations
        print("\n📂 Checking 'quotations' records...")
        try:
            resp = await client.get(f"{PB_URL}/api/collections/quotations/records", headers=headers)
            items = resp.json().get("items", [])
            for item in items:
                print(f" - ID: {item['id']}")
                print(f"   Status: '{item.get('status')}'")
                print(f"   Inquiry: {item.get('inquiry_id')}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
