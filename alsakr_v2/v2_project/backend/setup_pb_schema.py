import httpx
import asyncio
import os
import sys

# Internal URL inside docker network
PB_URL = "http://pocketbase:8090"
ADMIN_EMAIL = "admin@alsakronline.com"
ADMIN_PASS = "#Anas231#Bkar3110"

async def create_collection(client, token, name, schema):
    print(f"Checking collection {name}...")
    headers = {"Authorization": token}
    
    # Check if exists
    try:
        resp = await client.get(f"{PB_URL}/api/collections/{name}", headers=headers)
        if resp.status_code == 200:
            print(f"  - Exists.")
            return
    except Exception as e:
        print(f"  - Error checking: {e}")

    # Create
    data = {
        "name": name,
        "type": "base",
        "schema": schema,
        "listRule": None,  # null = public access (no auth required)
        "viewRule": None,
        "createRule": None,
        "updateRule": None,
        "deleteRule": None
    }
    
    resp = await client.post(f"{PB_URL}/api/collections", json=data, headers=headers)
    if resp.status_code == 200:
        print(f"  - Created successfully.")
    else:
        print(f"  - Failed: {resp.status_code} {resp.text}")

async def main():
    print("Starting PB Schema Setup...")
    async with httpx.AsyncClient() as client:
        # Auth
        try:
            # Try v0.23+ path first (superusers)
            auth_url = f"{PB_URL}/api/collections/_superusers/auth-with-password"
            print(f"Attempting auth via {auth_url}...")
            resp = await client.post(auth_url, json={
                "identity": ADMIN_EMAIL, "password": ADMIN_PASS
            })
            
            # If 404, fall back to legacy admins
            if resp.status_code == 404:
                auth_url = f"{PB_URL}/api/admins/auth-with-password"
                print(f"v0.23+ path failed (404), trying legacy {auth_url}...")
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


        # 1. Inquiries (MUST be first - other collections depend on it)
        await create_collection(client, token, "inquiries", [
            {"name": "buyer_id", "type": "text", "required": True},
            {"name": "products", "type": "json", "required": True},
            {"name": "message", "type": "text"},
            {"name": "status", "type": "select", "options": ["pending", "quoted", "closed"]}
        ])

        # 2. Quotations
        await create_collection(client, token, "quotations", [
            {"name": "inquiry_id", "type": "text", "required": True},
            {"name": "vendor_id", "type": "text", "required": True},
            {"name": "items", "type": "json"},
            {"name": "total_price", "type": "number"},
            {"name": "currency", "type": "text"},
            {"name": "status", "type": "select", "options": ["pending", "accepted", "rejected", "expired"]},
            {"name": "notes", "type": "text"}
        ])

        # 3. Messages
        await create_collection(client, token, "messages", [
            {"name": "inquiry_id", "type": "text", "required": True},
            {"name": "sender_id", "type": "text"},
            {"name": "sender_role", "type": "select", "options": ["buyer", "vendor"]},
            {"name": "content", "type": "text"},
            {"name": "read", "type": "bool"}
        ])

        # 4. Vendor Stock
        await create_collection(client, token, "vendor_stock", [
            {"name": "vendor_id", "type": "text", "required": True},
            {"name": "part_number", "type": "text", "required": True},
            {"name": "custom_price", "type": "number"},
            {"name": "stock_quantity", "type": "number"}
        ])

if __name__ == "__main__":
    asyncio.run(main())
