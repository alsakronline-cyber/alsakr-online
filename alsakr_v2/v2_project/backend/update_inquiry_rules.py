import asyncio
import httpx

# Configuration
PB_URL = "http://127.0.0.1:8090"
ADMIN_EMAIL = "admin@alsakronline.com"
ADMIN_PASSWORD = "#Anas231#Bkar3110"

async def main():
    print(f"Connecting to PocketBase at {PB_URL}...")
    
    async with httpx.AsyncClient() as client:
        # 1. Authenticate as Superuser (Admin)
        try:
            # PocketBase v0.23+ uses _superusers collection
            resp = await client.post(f"{PB_URL}/api/collections/_superusers/auth-with-password", json={
                "identity": ADMIN_EMAIL,
                "password": ADMIN_PASSWORD
            })
            if resp.status_code != 200:
                print(f"❌ Authentication failed: {resp.text}")
                return
            
            token = resp.json()["token"]
            headers = {"Authorization": token}
            print("✅ Admin authenticated successfully.")
        except Exception as e:
            print(f"❌ Connection error: {e}")
            return

        # 2. Update Collection Rules
        # Define rules for public access (null means public in PocketBase)
        # We set them to null (None) to allow unrestricted access for now.
        public_rules = {
            "listRule": None,
            "viewRule": None,
            "createRule": None,
            "updateRule": None,
            "deleteRule": None,
        }

        collections_to_update = ["inquiries", "quotations", "messages"]

        for collection_name in collections_to_update:
            print(f"Updating rules for '{collection_name}'...")
            try:
                # Update rules to null (public)
                resp = await client.patch(
                    f"{PB_URL}/api/collections/{collection_name}", 
                    json=public_rules, 
                    headers=headers
                )
                if resp.status_code == 200:
                    print(f"✅ Successfully updated rules for '{collection_name}' to PUBLIC (null).")
                else:
                    print(f"❌ Failed to update rules for '{collection_name}': {resp.text}")
                    
            except Exception as e:
                print(f"❌ Error updating collection '{collection_name}': {e}")

if __name__ == "__main__":
    asyncio.run(main())
