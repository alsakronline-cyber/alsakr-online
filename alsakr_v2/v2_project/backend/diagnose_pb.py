import asyncio
import httpx
import json

PB_URL = "http://127.0.0.1:8090"
ADMIN_EMAIL = "admin@alsakronline.com"
ADMIN_PASSWORD = "#Anas231#Bkar3110"

async def main():
    print(f"🔍 DIAGNOSTIC START: Connecting to {PB_URL}...")
    
    async with httpx.AsyncClient() as client:
        # 1. Superuser Auth
        token = None
        headers = {}
        try:
            resp = await client.post(f"{PB_URL}/api/collections/_superusers/auth-with-password", json={
                "identity": ADMIN_EMAIL, "password": ADMIN_PASSWORD
            })
            if resp.status_code == 200:
                print("✅ Superuser Auth: SUCCESS")
                token = resp.json()["token"]
                headers = {"Authorization": token}
            else:
                print(f"❌ Superuser Auth: FAILED ({resp.status_code}) - {resp.text}")
                # Try legacy admin path just in case
                resp = await client.post(f"{PB_URL}/api/admins/auth-with-password", json={
                    "identity": ADMIN_EMAIL, "password": ADMIN_PASSWORD
                })
                if resp.status_code == 200:
                    print("✅ Legacy Admin Auth: SUCCESS")
                    token = resp.json()["token"]
                    headers = {"Authorization": token}
                else:
                    print("❌ Legacy Admin Auth: FAILED")
                    return
        except Exception as e:
            print(f"❌ Connection Error: {e}")
            return

        # 2. Check Rules
        collections = ["inquiries", "quotations", "messages"]
        for col in collections:
            print(f"\n📂 Checking '{col}'...")
            try:
                resp = await client.get(f"{PB_URL}/api/collections/{col}", headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    print(f"   Rules: list={data.get('listRule')}, view={data.get('viewRule')}")
                    
                    # Fix if strict (non-null and non-empty)
                    # Note: Empty string "" is PUBLIC. null is PUBLIC (if created via API with null? No, API usually returns null as None).
                    # Actually, usually null means Admin Only? No, Empty string "" is strict?
                    # PocketBase: null = Admin only. "" (Empty String) = Public.
                    # Wait, setup_pb_schema sends 'null' which means Admin Only usually?
                    # Let's check PB docs.
                    # API Rules: null (default) = Only Admins. Empty string = Everyone.
                    # Wait, if I set it to None in Python, json dumps might make it null.
                    # If I want PUBLIC, I should send EMPTY STRING "".
                    
                    if data.get("listRule") is None: # Admin only
                         print("   ⚠️  Rules are STRICT (Admin Only). Updating to PUBLIC...")
                         await client.patch(f"{PB_URL}/api/collections/{col}", json={
                             "listRule": "", "viewRule": "", "createRule": "", "updateRule": "", "deleteRule": ""
                         }, headers=headers)
                         print("   ✅ Updated to PUBLIC.")
                else:
                    print(f"   ❌ Not Found (404)")
            except Exception as e:
                print(f"   ❌ Error: {e}")

            # 3. List Records
            try:
                # Try unauthenticated first?
                resp = await client.get(f"{PB_URL}/api/collections/{col}/records")
                if resp.status_code == 200:
                    count = resp.json().get("totalItems", 0)
                    print(f"   ✅ Public Access: OK. Found {count} records.")
                    items = resp.json().get("items", [])
                    for i, item in enumerate(items[:3]):
                         print(f"      - [{i}] ID: {item['id']}")
                         if col == 'inquiries':
                             print(f"        Buyer: {item.get('buyer_id')}")
                else:
                    print(f"   ⚠️  Public Access: DENIED ({resp.status_code})")
                    # Try admin list in case public failed
                    resp = await client.get(f"{PB_URL}/api/collections/{col}/records", headers=headers)
                    if resp.status_code == 200:
                        count = resp.json().get("totalItems", 0)
                        print(f"   ✅ Admin Access: OK. Found {count} records.")
                    else:
                        print(f"   ❌ Admin Access: FAILED ({resp.status_code})")

            except Exception as e:
                 print(f"   ❌ List Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
