
import requests
import json
import os
import time

PB_URL = os.environ.get("PB_URL", "http://pocketbase:8090")
EMAIL = "alsakronline@gmail.com"
PASSWORD = "1234567890" # The one we tried to set
# Fallback to the other one if needed
PASSWORD_ALT = "#Anas231#Bkar3110"

def get_token():
    # Try first password
    try:
        resp = requests.post(f"{PB_URL}/api/admins/auth-with-password", json={
            "identity": EMAIL,
            "password": PASSWORD
        })
        if resp.status_code == 200:
            print("Logged in with simple password")
            return resp.json()["token"]
    except Exception as e:
        print(f"Error connecting: {e}")

    # Try second password
    try:
        resp = requests.post(f"{PB_URL}/api/admins/auth-with-password", json={
            "identity": EMAIL,
            "password": PASSWORD_ALT
        })
        if resp.status_code == 200:
            print("Logged in with complex password")
            return resp.json()["token"]
    except Exception as e:
        print(f"Error connecting: {e}")
        
    print("Failed to login as admin")
    return None

def update_collection_rules(token):
    headers = {"Authorization": token}
    
    # Fetch user collection
    try:
        # We need to find the ID of the users collection or use name 'users'
        # PocketBase API allows fetching by name usually, or we list.
        resp = requests.get(f"{PB_URL}/api/collections/users", headers=headers)
        if resp.status_code != 200:
            print(f"Failed to fetch users collection: {resp.text}")
            return
            
        collection = resp.json()
        
        # Update rules to be permissive
        # Empty string "" means public
        # We want to allow anyone to create (register)
        # We want to allow users to see their own data? Or public?
        # User said "remove all restrictions". Let's make it relatively open but sensible.
        
        updates = {
            "listRule": "",      # Public list (careful, but requested) -> actually better: "@request.auth.id != ''" to allow logged in users to list? Or just "" to debug. Let's use "" for max permissiveness as requested.
            "viewRule": "",      # Public view
            "createRule": "",    # Public create
            "updateRule": "id = @request.auth.id", # Users edit own
            "deleteRule": "id = @request.auth.id", # Users delete own
        }
        
        # Merge updates
        collection.update(updates)
        
        # Save
        resp = requests.patch(f"{PB_URL}/api/collections/users", headers=headers, json=collection)
        if resp.status_code == 200:
            print("Updated 'users' collection rules to be permissive.")
        else:
            print(f"Failed to update rules: {resp.text}")
            
    except Exception as e:
        print(f"Error updating collection: {e}")

def disable_verification_setting(token):
    headers = {"Authorization": token}
    try:
        resp = requests.get(f"{PB_URL}/api/settings", headers=headers)
        if resp.status_code != 200:
            print("Failed to fetch settings")
            return
            
        settings = resp.json()
        
        # meta.verificationRequired - this might not be the exact key, let's look for likely ones
        # Usually checking 'meta' or 'verification'
        # In modern PB, simple auth doesn't forcibly require verification globally unless code enforces it.
        # But we can check SMTP settings too.
        
        changed = False
        # If there's a setting for it, disable it. 
        # (PocketBase doesn't have a global "Strict verification for login" switch in settings JSON usually, it's specific to the client implementation, but good to check)
        
        print("Current Settings keys:", settings.keys())
        
    except Exception as e:
        print(f"Error checking settings: {e}")

def main():
    print("Starting configuration...")
    token = get_token()
    if not token:
        # Try to CREATE superuser if login failed?
        # We can't via API if no one is logged in, but we assume CLI worked.
        print("Could not get admin token. Aborting rule update.")
        return

    update_collection_rules(token)
    disable_verification_setting(token)

if __name__ == "__main__":
    main()
