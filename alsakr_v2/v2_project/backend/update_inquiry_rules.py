import httpx
import asyncio
import sys

# Internal URL inside docker network
PB_URL = "http://pocketbase:8090"
ADMIN_EMAIL = "admin@alsakronline.com"
ADMIN_PASS = "#Anas231#Bkar3110"

async def main():
    print("Starting Inquiry Rules Update...")
    async with httpx.AsyncClient() as client:
        # Auth
        try:
            # Try v0.23+ path first (superusers)
            auth_url = f"{PB_URL}/api/collections/_superusers/auth-with-password"
            resp = await client.post(auth_url, json={
                "identity": ADMIN_EMAIL, "password": ADMIN_PASS
            })
            
            # If 404, fall back to legacy admins
            if resp.status_code == 404:
                auth_url = f"{PB_URL}/api/admins/auth-with-password"
                resp = await client.post(auth_url, json={
                    "identity": ADMIN_EMAIL, "password": ADMIN_PASS
                })

            if resp.status_code != 200:
                print(f"Admin auth failed: {resp.text}")
                return
            token = resp.json()["token"]
            print("Admin authenticated.")
        except Exception as e:
            print(f"Connection error to {PB_URL}: {e}")
            return

        headers = {"Authorization": token}
        
        # Get existing collection
        try:
            resp = await client.get(f"{PB_URL}/api/collections/inquiries", headers=headers)
            if resp.status_code != 200:
                print(f"Error fetching collection: {resp.text}")
                return
            
            collection = resp.json()
            print(f"Current rules: {collection.get('listRule')}, {collection.get('createRule')}")
            
            # Update rules to null (public)
            data = {
                "listRule": None,
                "viewRule": None,
                "createRule": None,
                "updateRule": None,
                "deleteRule": None
            }
            
            resp = await client.patch(f"{PB_URL}/api/collections/inquiries", json=data, headers=headers)
            if resp.status_code == 200:
                print("Successfully updated inquiry rules to PUBLIC (null).")
            else:
                print(f"Failed to update rules: {resp.text}")
                
        except Exception as e:
            print(f"Error updating collection: {e}")

if __name__ == "__main__":
    asyncio.run(main())
