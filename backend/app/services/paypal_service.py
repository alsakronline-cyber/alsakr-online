"""
PayPal Payment Service
Handles PayPal order creation, capture, and webhook processing
"""

import os
import requests
import base64
from typing import Dict, Any
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)

PAYPAL_CLIENT_ID = os.getenv("PAYPAL_CLIENT_ID")
PAYPAL_CLIENT_SECRET = os.getenv("PAYPAL_CLIENT_SECRET")
PAYPAL_MODE = os.getenv("PAYPAL_MODE", "sandbox")  # sandbox or live

# PayPal API base URLs
PAYPAL_API_URL = (
    "https://api-m.sandbox.paypal.com" if PAYPAL_MODE == "sandbox"
    else "https://api-m.paypal.com"
)

class PayPalService:
    @staticmethod
    async def get_access_token() -> str:
        """
        Get PayPal OAuth access token
        """
        try:
            url = f"{PAYPAL_API_URL}/v1/oauth2/token"
            headers = {
                "Accept": "application/json",
                "Accept-Language": "en_US",
            }
            
            # Create basic auth header
            auth_string = f"{PAYPAL_CLIENT_ID}:{PAYPAL_CLIENT_SECRET}"
            auth_bytes = auth_string.encode('ascii')
            base64_bytes = base64.b64encode(auth_bytes)
            base64_string = base64_bytes.decode('ascii')
            
            headers["Authorization"] = f"Basic {base64_string}"
            
            data = {"grant_type": "client_credentials"}
            
            response = requests.post(url, headers=headers, data=data)
            response.raise_for_status()
            
            return response.json()["access_token"]
            
        except requests.exceptions.RequestException as e:
            logger.error(f"PayPal auth error: {str(e)}")
            raise HTTPException(status_code=500, detail="PayPal authentication failed")

    @staticmethod
    async def create_order(amount: float, currency: str = "USD", order_id: str = None) -> Dict[str, Any]:
        """
        Create a PayPal order
        Args:
            amount: Total amount
            currency: Currency code (USD, EUR, etc.)
            order_id: Internal order ID for reference
        """
        try:
            access_token = await PayPalService.get_access_token()
            
            url = f"{PAYPAL_API_URL}/v2/checkout/orders"
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {access_token}",
            }
            
            payload = {
                "intent": "CAPTURE",
                "purchase_units": [
                    {
                        "amount": {
                            "currency_code": currency,
                            "value": f"{amount:.2f}"
                        },
                        "reference_id": order_id or "default",
                        "description": f"Order {order_id}" if order_id else "Purchase"
                    }
                ],
                "application_context": {
                    "return_url": f"{os.getenv('FRONTEND_URL', 'https://app.alsakronline.com')}/payment/success",
                    "cancel_url": f"{os.getenv('FRONTEND_URL', 'https://app.alsakronline.com')}/payment/cancel",
                }
            }
            
            response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()
           
            data = response.json()
            
            logger.info(f"Created PayPal order: {data['id']}")
            
            # Find the approval URL
            approval_url = None
            for link in data.get("links", []):
                if link.get("rel") == "approve":
                    approval_url = link.get("href")
                    break
            
            return {
                "order_id": data["id"],
                "status": data["status"],
                "approval_url": approval_url,
                "amount": amount,
                "currency": currency
            }
            
        except requests.exceptions.RequestException as e:
            logger.error(f"PayPal order creation error: {str(e)}")
            raise HTTPException(status_code=400, detail=f"PayPal order creation failed: {str(e)}")

    @staticmethod
    async def capture_order(paypal_order_id: str) -> Dict[str, Any]:
        """
        Capture a PayPal order after approval
        Args:
            paypal_order_id: PayPal order ID
        """
        try:
            access_token = await PayPalService.get_access_token()
            
            url = f"{PAYPAL_API_URL}/v2/checkout/orders/{paypal_order_id}/capture"
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {access_token}",
            }
            
            response = requests.post(url, headers=headers)
            response.raise_for_status()
            
            data = response.json()
            
            logger.info(f"Captured PayPal order: {paypal_order_id}")
            
            # Extract capture details
            capture = data["purchase_units"][0]["payments"]["captures"][0]
            
            return {
                "order_id": data["id"],
                "status": data["status"],
                "capture_id": capture["id"],
                "capture_status": capture["status"],
                "amount": float(capture["amount"]["value"]),
                "currency": capture["amount"]["currency_code"]
            }
            
        except requests.exceptions.RequestException as e:
            logger.error(f"PayPal capture error: {str(e)}")
            raise HTTPException(status_code=400, detail=f"PayPal capture failed: {str(e)}")

    @staticmethod
    async def get_order_details(paypal_order_id: str) -> Dict[str, Any]:
        """
        Get details of a PayPal order
        """
        try:
            access_token = await PayPalService.get_access_token()
            
            url = f"{PAYPAL_API_URL}/v2/checkout/orders/{paypal_order_id}"
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {access_token}",
            }
            
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            
            data = response.json()
            
            return {
                "order_id": data["id"],
                "status": data["status"],
                "amount": float(data["purchase_units"][0]["amount"]["value"]),
                "currency": data["purchase_units"][0]["amount"]["currency_code"]
            }
            
        except requests.exceptions.RequestException as e:
            logger.error(f"PayPal get order error: {str(e)}")
            raise HTTPException(status_code=404, detail="PayPal order not found")

    @staticmethod
    async def create_refund(capture_id: str, amount: float = None, currency: str = "USD") -> Dict[str, Any]:
        """
        Create a refund for a captured payment
        Args:
            capture_id: PayPal capture ID
            amount: Amount to refund (None for full refund)
            currency: Currency code
        """
        try:
            access_token = await PayPalService.get_access_token()
            
            url = f"{PAYPAL_API_URL}/v2/payments/captures/{capture_id}/refund"
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {access_token}",
            }
            
            payload = {}
            if amount:
                payload["amount"] = {
                    "value": f"{amount:.2f}",
                    "currency_code": currency
                }
            
            response = requests.post(url, json=payload if payload else None, headers=headers)
            response.raise_for_status()
            
            data = response.json()
            
            logger.info(f"Created PayPal refund: {data['id']}")
            
            return {
                "refund_id": data["id"],
                "status": data["status"],
                "amount": float(data["amount"]["value"]) if "amount" in data else None,
                "currency": data["amount"]["currency_code"] if "amount" in data else None
            }
            
        except requests.exceptions.RequestException as e:
            logger.error(f"PayPal refund error: {str(e)}")
            raise HTTPException(status_code=400, detail=f"PayPal refund failed: {str(e)}")
