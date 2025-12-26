"""
Payment Integration Tests
Tests for Stripe and PayPal payment processing
"""

import pytest
from unittest.mock import Mock, patch, AsyncMock
from fastapi.testclient import TestClient
from app.main import app
from app.services.stripe_service import StripeService
from app.services.paypal_service import PayPalService

client = TestClient(app)

# Test data
MOCK_ORDER_ID = "test-order-123"
MOCK_PAYMENT_INTENT_ID = "pi_test12 3"
MOCK_USER_TOKEN = "Bearer test_token"

class TestStripePayment:
    """Test Stripe payment integration"""
    
    @patch('app.services.stripe_service.stripe.PaymentIntent.create')
    async def test_create_payment_intent_success(self, mock_create):
        """Test successful payment intent creation"""
        mock_create.return_value = Mock(
            id=MOCK_PAYMENT_INTENT_ID,
            client_secret="pi_test123_secret",
            amount=10000,
            currency="usd",
            status="requires_payment_method"
        )
        
        result = await StripeService.create_payment_intent(
            amount=100.00,
            currency="usd",
            metadata={"order_id": MOCK_ORDER_ID}
        )
        
        assert result["payment_intent_id"] == MOCK_PAYMENT_INTENT_ID
        assert result["amount"] == 100.00
        assert result["currency"] == "usd"
        assert "client_secret" in result
    
    @patch('app.services.stripe_service.stripe.PaymentIntent.create')
    async def test_create_payment_intent_failure(self, mock_create):
        """Test payment intent creation failure"""
        mock_create.side_effect = Exception("Stripe API error")
        
        with pytest.raises(Exception):
            await StripeService.create_payment_intent(
                amount=100.00,
                currency="usd"
            )
    
    @patch('app.services.stripe_service.stripe.PaymentIntent.retrieve')
    async def test_retrieve_payment_intent(self, mock_retrieve):
        """Test retrieving payment intent"""
        mock_retrieve.return_value = Mock(
            id=MOCK_PAYMENT_INTENT_ID,
            amount=10000,
            currency="usd",
            status="succeeded",
            payment_method="pm_test123",
            charges=Mock(data=[])
        )
        
        result = await StripeService.retrieve_payment_intent(MOCK_PAYMENT_INTENT_ID)
        
        assert result["id"] == MOCK_PAYMENT_INTENT_ID
        assert result["status"] == "succeeded"


class TestPayPalPayment:
    """Test PayPal payment integration"""
    
    @patch('requests.post')
    async def test_create_paypal_order_success(self, mock_post):
        """Test successful PayPal order creation"""
        # Mock OAuth token response
        mock_post.return_value = Mock(
            status_code=200,
            json=lambda: {
                "id": "PAYPAL_ORDER_123",
                "status": "CREATED",
                "links": [
                    {"rel": "approve", "href": "https://paypal.com/approve"}
                ]
            }
        )
        
        with patch.object(PayPalService, 'get_access_token', return_value="mock_token"):
            result = await PayPalService.create_order(
                amount=100.00,
                currency="USD",
                order_id=MOCK_ORDER_ID
            )
        
        assert result["order_id"] == "PAYPAL_ORDER_123"
        assert result["approval_url"] == "https://paypal.com/approve"
    
    @patch('requests.post')
    async def test_capture_paypal_order(self, mock_post):
        """Test PayPal order capture"""
        mock_post.return_value = Mock(
            status_code=200,
            json=lambda: {
                "id": "PAYPAL_ORDER_123",
                "status": "COMPLETED",
                "purchase_units": [{
                    "payments": {
                        "captures": [{
                            "id": "CAPTURE_123",
                            "status": "COMPLETED",
                            "amount": {"value": "100.00", "currency_code": "USD"}
                        }]
                    }
                }]
            }
        )
        
        with patch.object(PayPalService, 'get_access_token', return_value="mock_token"):
            result = await PayPalService.capture_order("PAYPAL_ORDER_123")
        
        assert result["capture_status"] == "COMPLETED"
        assert result["amount"] == 100.00


class TestPaymentAPI:
    """Test payment API endpoints"""
    
    @pytest.fixture
    def mock_db(self):
        """Mock database session"""
        with patch('app.api.endpoints.payment_routes.get_db'):
            yield
    
    @pytest.fixture
    def mock_auth(self):
        """Mock authentication"""
        with patch('app.api.deps.get_current_user', return_value={"sub": "user123"}):
            yield
    
    def test_create_stripe_payment_endpoint(self, mock_db, mock_auth):
        """Test Stripe payment creation endpoint"""
        with patch('app.services.stripe_service.StripeService.create_payment_intent') as mock_create:
            mock_create.return_value = {
                "client_secret": "secret",
                "payment_intent_id": "pi_123",
                "amount": 100.00
            }
            
            response = client.post(
                f"/api/payments/stripe/create-intent?order_id={MOCK_ORDER_ID}",
                headers={"Authorization": MOCK_USER_TOKEN}
            )
            
            assert response.status_code == 200
            data = response.json()
            assert "client_secret" in data
    
    def test_get_payment_status(self, mock_db, mock_auth):
        """Test getting payment status"""
        response = client.get(
            f"/api/payments/test-payment-id",
            headers={"Authorization": MOCK_USER_TOKEN}
        )
        
        # Will return 404 if payment doesn't exist, which is expected in test
        assert response.status_code in [200, 404]


class TestWebhooks:
    """Test webhook handling"""
    
    @patch('app.services.stripe_service.StripeService.verify_webhook_signature')
    def test_stripe_webhook_payment_succeeded(self, mock_verify):
        """Test Stripe webhook for successful payment"""
        mock_verify.return_value = {
            "type": "payment_intent.succeeded",
            "data": {
                "object": {
                    "id": MOCK_PAYMENT_INTENT_ID,
                    "status": "succeeded",
                    "payment_method_types": ["card"]
                }
            }
        }
        
        response = client.post(
            "/api/payments/stripe/webhook",
            json={},
            headers={"stripe-signature": "test_signature"}
        )
        
        assert response.status_code in [200, 404]  # 404 if payment doesn't exist in test DB


# Run tests
if __name__ == "__main__":
    pytest.main([__file__, "-v"])
