"""
Stripe Payment Service
Handles Stripe payment intent creation, confirmation, and webhook processing
"""

import stripe
import os
from typing import Dict, Any
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)

# Initialize Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

class StripeService:
    @staticmethod
    async def create_payment_intent(
        amount: float,
        currency: str = "usd",
        metadata: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Create a Stripe PaymentIntent
        Args:
            amount: Amount in the currency's smallest unit (e.g., cents for USD)
            currency: Three-letter ISO currency code
            metadata: Additional data to attach to the payment
        """
        try:
            # Convert amount to cents
            amount_cents = int(amount * 100)
            
            payment_intent = stripe.PaymentIntent.create(
                amount=amount_cents,
                currency=currency.lower(),
                metadata=metadata or {},
                automatic_payment_methods={
                    'enabled': True,
                },
            )
            
            logger.info(f"Created Stripe PaymentIntent: {payment_intent.id}")
            
            return {
                "client_secret": payment_intent.client_secret,
                "payment_intent_id": payment_intent.id,
                "amount": payment_intent.amount / 100,  # Convert back to dollars
                "currency": payment_intent.currency,
                "status": payment_intent.status
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")
        except Exception as e:
            logger.error(f"Error creating payment intent: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to create payment intent")

    @staticmethod
    async def retrieve_payment_intent(payment_intent_id: str) -> Dict[str, Any]:
        """
        Retrieve a Stripe PaymentIntent by ID
        """
        try:
            payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            
            return {
                "id": payment_intent.id,
                "amount": payment_intent.amount / 100,
                "currency": payment_intent.currency,
                "status": payment_intent.status,
                "payment_method": payment_intent.payment_method,
                "charges": payment_intent.charges.data if payment_intent.charges else []
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error retrieving payment: {str(e)}")
            raise HTTPException(status_code=404, detail="Payment not found")

    @staticmethod
    async def confirm_payment_intent(payment_intent_id: str) -> Dict[str, Any]:
        """
        Confirm a Stripe PaymentIntent
        """
        try:
            payment_intent = stripe.PaymentIntent.confirm(payment_intent_id)
            return {
                "id": payment_intent.id,
                "status": payment_intent.status
            }
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error confirming payment: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Payment confirmation failed: {str(e)}")

    @staticmethod
    async def cancel_payment_intent(payment_intent_id: str) -> Dict[str, Any]:
        """
        Cancel a Stripe PaymentIntent
        """
        try:
            payment_intent = stripe.PaymentIntent.cancel(payment_intent_id)
            return {
                "id": payment_intent.id,
                "status": payment_intent.status
            }
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error cancelling payment: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Payment cancellation failed: {str(e)}")

    @staticmethod
    def verify_webhook_signature(payload: bytes, sig_header: str) -> Any:
        """
        Verify Stripe webhook signature
        """
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, STRIPE_WEBHOOK_SECRET
            )
            return event
        except ValueError as e:
            logger.error(f"Invalid payload: {e}")
            raise HTTPException(status_code=400, detail="Invalid payload")
        except stripe.error.SignatureVerificationError as e:
            logger.error(f"Invalid signature: {e}")
            raise HTTPException(status_code=400, detail="Invalid signature")

    @staticmethod
    async def create_refund(
        payment_intent_id: str,
        amount: float = None,
        reason: str = None
    ) -> Dict[str, Any]:
        """
        Create a refund for a payment
        Args:
            payment_intent_id: The PaymentIntent ID to refund
            amount: Amount to refund (None for full refund)
            reason: Reason for the refund
        """
        try:
            refund_params = {"payment_intent": payment_intent_id}
            
            if amount:
                refund_params["amount"] = int(amount * 100)  # Convert to cents
            if reason:
                refund_params["reason"] = reason
                
            refund = stripe.Refund.create(**refund_params)
            
            logger.info(f"Created refund: {refund.id}")
            
            return {
                "refund_id": refund.id,
                "amount": refund.amount / 100,
                "status": refund.status,
                "reason": refund.reason
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error creating refund: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Refund failed: {str(e)}")
