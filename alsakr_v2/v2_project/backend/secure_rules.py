import httpx
import asyncio
import os

# Configuration
PB_URL = os.getenv("PB_URL", "http://localhost:8090")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@alsakronline.com")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "#Anas231#Bkar3110")

async def secure_rules():
    print("🔐 Securing PocketBase Collections (Reverting to Admin Only)...")
    
    async with httpx.AsyncClient() as client:
        # 1. Authenticate
        try:
            auth_resp = await client.post(
                f"{PB_URL}/api/collections/_superusers/auth-with-password",
                json={"identity": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
                timeout=5.0
            )
            # Fallback for older PB versions
            if auth_resp.status_code == 404:
                auth_resp = await client.post(
                    f"{PB_URL}/api/admins/auth-with-password",
                    json={"identity": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
                    timeout=5.0
                )
            
            auth_resp.raise_for_status()
            token = auth_resp.json()["token"]
            headers = {"Authorization": token}
            print("✅ Authenticated successfully.")
        except Exception as e:
            print(f"❌ Authentication failed: {e}")
            return

        # 2. Update Rules to Admin Only (None)
        collections_to_secure = ["inquiries", "quotations", "messages"]
        
        for col_name in collections_to_secure:
            try:
                # Retrieve current collection to get ID (optional, but good for validation)
                # Actually we can just update by name
                
                # Rule 'null' (None in Python) means Admin Only. 
                # Rule "" (Empty string) means Public.
                
                payload = {
                    "listRule": None,
                    "viewRule": None,
                    "createRule": None, # Backend creates as Admin, so this blocks public creation
                    "updateRule": None,
                    "deleteRule": None
                }
                
                # Exception: Inquiries creation MIGHT need to be public if we allow unauthenticated users?
                # The prompt context says "Logged-in buyers".
                # If frontend sends requests, it must be authenticated as a User (auth_id != "")
                # or Backend acts as proxy.
                # Current Architecture: Backend is Proxy. Frontend calls Backend API. Backend calls PocketBase.
                # So PocketBase rules should be Strict Admin Only (None).
                
                resp = await client.patch(
                    f"{PB_URL}/api/collections/{col_name}",
                    json=payload,
                    headers=headers,
                    timeout=5.0
                )
                resp.raise_for_status()
                print(f"🔒 Secured collection: {col_name} (Rules set to Admin Only)")
                
            except Exception as e:
                print(f"❌ Failed to secure {col_name}: {e}")

if __name__ == "__main__":
    asyncio.run(secure_rules())
