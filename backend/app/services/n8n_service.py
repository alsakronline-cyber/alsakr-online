"""
n8n Service
Triggers n8n workflows via webhooks for automated notifications
"""

import os
import requests
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

N8N_WEBHOOK_BASE_URL = os.getenv("N8N_WEBHOOK_URL", "http://n8n:5678/webhook")

class N8NService:
    @staticmethod
    async def trigger_order_notification(order_data: Dict[str, Any]) -> bool:
        """
        Trigger order notification workflow
        Args:
            order_data: Order details including buyer, vendor, items
        """
        try:
            webhook_url = f"{N8N_WEBHOOK_BASE_URL}/order-created"
            
            response = requests.post(
                webhook_url,
                json=order_data,
                timeout=5
            )
            
            if response.status_code == 200:
                logger.info(f"Order notification sent for order {order_data.get('order_id')}")
                return True
            else:
                logger.warning(f"n8n webhook returned status {response.status_code}")
                return False
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to trigger order notification: {str(e)}")
            return False

    @staticmethod
    async def trigger_payment_confirmation(payment_data: Dict[str, Any]) -> bool:
        """
        Trigger payment confirmation workflow
        Args:
            payment_data: Payment details including amount, method
        """
        try:
            webhook_url = f"{N8N_WEBHOOK_BASE_URL}/payment-confirmed"
            
            response = requests.post(
                webhook_url,
                json=payment_data,
                timeout=5
            )
            
            if response.status_code == 200:
                logger.info(f"Payment confirmation sent for payment {payment_data.get('payment_id')}")
                return True
            else:
                logger.warning(f"n8n webhook returned status {response.status_code}")
                return False
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to trigger payment confirmation: {str(e)}")
            return False

    @staticmethod
    async def trigger_rfq_notification(rfq_data: Dict[str, Any]) -> bool:
        """
        Trigger RFQ notification workflow
        Args:
            rfq_data: RFQ details
        """
        try:
            webhook_url = f"{N8N_WEBHOOK_BASE_URL}/rfq-created"
            
            response = requests.post(
                webhook_url,
                json=rfq_data,
                timeout=5
            )
            
            if response.status_code == 200:
                logger.info(f"RFQ notification sent for RFQ {rfq_data.get('rfq_id')}")
                return True
            else:
                logger.warning(f"n8n webhook returned status {response.status_code}")
                return False
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to trigger RFQ notification: {str(e)}")
            return False

    @staticmethod
    async def trigger_quote_notification(quote_data: Dict[str, Any]) -> bool:
        """
        Trigger quote notification workflow
        Args:
            quote_data: Quote details
        """
        try:
            webhook_url = f"{N8N_WEBHOOK_BASE_URL}/quote-submitted"
            
            response = requests.post(
                webhook_url,
                json=quote_data,
                timeout=5
            )
            
            if response.status_code == 200:
                logger.info(f"Quote notification sent for quote {quote_data.get('quote_id')}")
                return True
            else:
                logger.warning(f"n8n webhook returned status {response.status_code}")
                return False
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to trigger quote notification: {str(e)}")
            return False
