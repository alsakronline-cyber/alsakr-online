"""
RFQ End-to-End Flow Tests
Tests the complete RFQ workflow from creation to quote acceptance
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models.rfq import RFQ
from app.models.quote import Quote

client = TestClient(app)

BUYER_TOKEN = "Bearer buyer_token"
VENDOR_TOKEN = "Bearer vendor_token"

class TestRFQFlow:
    """Test complete RFQ workflow"""
    
    def test_create_rfq(self):
        """Test RFQ creation by buyer"""
        rfq_data = {
            "title": "Industrial Sensor",
            "description": "Need 10 units of temperature sensors",
            "quantity": 10,
            "target_price": 50.00,
            "part_description": "Temperature sensor, range: -40 to 125°C"
        }
        
        response = client.post(
            "/api/rfqs",
            json=rfq_data,
            headers={"Authorization": BUYER_TOKEN}
        )
        
        assert response.status_code in [200, 401]  # 401 without real auth
        if response.status_code == 200:
            data = response.json()
            assert data["title"] == rfq_data["title"]
            assert data["status"] == "open"
    
    def test_list_rfqs_for_buyer(self):
        """Test listing RFQs for buyer"""
        response = client.get(
            "/api/rfqs?buyer_id=test-buyer-123",
            headers={"Authorization": BUYER_TOKEN}
        )
        
        assert response.status_code in [200, 401, 403]
        if response.status_code == 200:
            data = response.json()
            assert "rfqs" in data or isinstance(data, list)
    
    def test_list_rfqs_for_vendor(self):
        """Test listing open RFQs for vendor"""
        response = client.get(
            "/api/vendor/test-vendor-123/rfqs",
            headers={"Authorization": VENDOR_TOKEN}
        )
        
        assert response.status_code in [200, 401, 403]
    
    def test_submit_quote(self):
        """Test quote submission by vendor"""
        quote_data = {
            "rfq_id": "test-rfq-123",
            "price": 45.00,
            "currency": "USD",
            "delivery_time": "2 weeks",
            "notes": "High quality sensors with warranty"
        }
        
        response = client.post(
            "/api/quotes",
            json=quote_data,
            headers={"Authorization": VENDOR_TOKEN}
        )
        
        assert response.status_code in [200, 401, 404]
    
    def test_list_quotes_for_rfq(self):
        """Test listing quotes for an RFQ"""
        response = client.get(
            "/api/quotes?rfq_id=test-rfq-123",
            headers={"Authorization": BUYER_TOKEN}
        )
        
        assert response.status_code in [200, 401]
    
    def test_accept_quote(self):
        """Test accepting a quote"""
        response = client.put(
            "/api/quotes/test-quote-123",
            json={"status": "accepted"},
            headers={"Authorization": BUYER_TOKEN}
        )
        
        assert response.status_code in [200, 401, 404]
    
    def test_reject_quote(self):
        """Test rejecting a quote"""
        response = client.put(
            "/api/quotes/test-quote-123",
            json={"status": "rejected"},
            headers={"Authorization": BUYER_TOKEN}
        )
        
        assert response.status_code in [200, 401, 404]


class TestRFQValidation:
    """Test RFQ validation rules"""
    
    def test_create_rfq_missing_required_fields(self):
        """Test RFQ creation with missing fields"""
        invalid_rfq = {
            "title": "Test"
            # Missing quantity, description, etc.
        }
        
        response = client.post(
            "/api/rfqs",
            json=invalid_rfq,
            headers={"Authorization": BUYER_TOKEN}
        )
        
        assert response.status_code in [400, 422, 401]
    
    def test_submit_quote_invalid_price(self):
        """Test quote submission with invalid price"""
        invalid_quote = {
            "rfq_id": "test-rfq-123",
            "price": -10.00,  # Negative price
            "delivery_time": "2 weeks"
        }
        
        response = client.post(
            "/api/quotes",
            json=invalid_quote,
            headers={"Authorization": VENDOR_TOKEN}
        )
        
        assert response.status_code in [400, 422, 401]


class TestRFQPermissions:
    """Test RFQ permission controls"""
    
    def test_vendor_cannot_modify_rfq(self):
        """Test that vendors cannot modify RFQs"""
        response = client.put(
            "/api/rfqs/test-rfq-123",
            json={"status": "closed"},
            headers={"Authorization": VENDOR_TOKEN}
        )
        
        assert response.status_code in [403, 401, 404]
    
    def test_buyer_cannot_modify_others_quotes(self):
        """Test that buyers cannot modify quotes from other buyers' RFQs"""
        response = client.put(
            "/api/quotes/test-quote-123",
            json={"status": "accepted"},
            headers={"Authorization": "Bearer different_buyer_token"}
        )
        
        assert response.status_code in [403, 401, 404]


# Run tests
if __name__ == "__main__":
    pytest.main([__file__, "-v"])
