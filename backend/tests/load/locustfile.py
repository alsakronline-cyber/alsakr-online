"""
Load Testing with Locust
Performance testing for API endpoints
"""

from locust import HttpUser, task, between
import random
import json

class AlsakrUser(HttpUser):
    """Simulated user for load testing"""
    wait_time = between(1, 3)  # Wait 1-3 seconds between tasks
    
    def on_start(self):
        """Login and get auth token"""
        # Test login
        response = self.client.post("/api/auth/login", json={
            "email": "test@example.com",
            "password": "test123"
        })
        
        if response.status_code == 200:
            data = response.json()
            self.token = data.get("access_token")
        else:
            self.token = None
    
    @task(3)
    def browse_products(self):
        """Browse products - most common action"""
        self.client.get("/api/catalog/products?limit=20")
    
    @task(2)
    def search_products(self):
        """Search for products"""
        search_terms = ["sensor", "valve", "motor", "bearing", "pump"]
        term = random.choice(search_terms)
        
        self.client.post("/api/search/text", json={
            "query": term,
            "limit": 10
        })
    
    @task(1)
    def view_product_details(self):
        """View product details"""
        product_id = f"product-{random.randint(1, 100)}"
        self.client.get(f"/api/catalog/products/{product_id}")
    
    @task(1)
    def view_rfqs(self):
        """View RFQs (requires auth)"""
        if self.token:
            headers = {"Authorization": f"Bearer {self.token}"}
            self.client.get("/api/rfqs", headers=headers)
    
    @task(1)
    def create_rfq(self):
        """Create a new RFQ (requires auth)"""
        if self.token:
            headers = {"Authorization": f"Bearer {self.token}"}
            rfq_data = {
                "title": f"Test RFQ {random.randint(1000, 9999)}",
                "description": "Load test RFQ",
                "quantity": random.randint(1, 100),
                "target_price": random.uniform(10, 1000),
                "part_description": "Test part"
            }
            
            self.client.post("/api/rfqs", json=rfq_data, headers=headers)


class BuyerUser(HttpUser):
    """Buyer-specific user behavior"""
    wait_time = between(2, 5)
    
    def on_start(self):
        response = self.client.post("/api/auth/login", json={
            "email": "buyer@example.com",
            "password": "test123"
        })
        
        if response.status_code == 200:
            self.token = response.json().get("access_token")
            self.user_id = response.json().get("user_id")
        else:
            self.token = None
    
    @task(3)
    def view_my_rfqs(self):
        """View my RFQs"""
        if self.token:
            headers = {"Authorization": f"Bearer {self.token}"}
            self.client.get(f"/api/rfqs?buyer_id={self.user_id}", headers=headers)
    
    @task(2)
    def view_quotes(self):
        """View quotes for my RFQs"""
        if self.token:
            headers = {"Authorization": f"Bearer {self.token}"}
            self.client.get("/api/quotes", headers=headers)
    
    @task(1)
    def view_orders(self):
        """View my orders"""
        if self.token:
            headers = {"Authorization": f"Bearer {self.token}"}
            self.client.get(f"/api/orders?buyer_id={self.user_id}", headers=headers)


class VendorUser(HttpUser):
    """Vendor-specific user behavior"""
    wait_time = between(2, 5)
    
    def on_start(self):
        response = self.client.post("/api/auth/login", json={
            "email": "vendor@example.com",
            "password": "test123"
        })
        
        if response.status_code == 200:
            self.token = response.json().get("access_token")
            self.user_id = response.json().get("user_id")
        else:
            self.token = None
    
    @task(3)
    def view_marketplace_rfqs(self):
        """View open RFQs in marketplace"""
        if self.token:
            headers = {"Authorization": f"Bearer {self.token}"}
            self.client.get(f"/api/vendor/{self.user_id}/rfqs", headers=headers)
    
    @task(2)
    def view_my_quotes(self):
        """View my submitted quotes"""
        if self.token:
            headers = {"Authorization": f"Bearer {self.token}"}
            self.client.get("/api/quotes", headers=headers)
    
    @task(1)
    def submit_quote(self):
        """Submit a quote"""
        if self.token:
            headers = {"Authorization": f"Bearer {self.token}"}
            quote_data = {
                "rfq_id": f"rfq-{random.randint(1, 50)}",
                "price": random.uniform(50, 500),
                "delivery_time": f"{random.randint(1, 4)} weeks",
                "notes": "Load test quote"
            }
            
            self.client.post("/api/quotes", json=quote_data, headers=headers)


# Run command:
# locust -f backend/tests/load/locustfile.py --host=https://api.app.alsakronline.com
#
# For local testing:
# locust -f backend/tests/load/locustfile.py --host=http://localhost:8000
#
# Access web UI at: http://localhost:8089
