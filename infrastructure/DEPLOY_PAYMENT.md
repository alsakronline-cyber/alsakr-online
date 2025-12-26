# Payment Integration Deployment Guide

## Overview
Deploy Stripe and PayPal payment processing to the production environment.

---

## Prerequisites

- Active Stripe account
- Active PayPal Business account
- Access to VPS and environment configuration

---

## Step 1: Stripe Setup

### 1.1 Create Stripe Account
1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Create account or login
3. Complete business verification

### 1.2 Get API Keys
1. Navigate to **Developers** → **API Keys**
2. Copy your **Publishable** and **Secret** keys
3. Get **Webhook signing secret**:
   - Go to **Developers** → **Webhooks**
   - Click **Add endpoint**
   - URL: `https://api.app.alsakronline.com/api/payments/stripe/webhook`
   - Events: Select `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy the **Signing secret**

---

## Step 2: PayPal Setup

### 2.1 Create PayPal Business Account
1. Go to [paypal.com/business](https://www.paypal.com/business)
2. Create business account

### 2.2 Get API Credentials
1. Go to [developer.paypal.com](https://developer.paypal.com)
2. Navigate to **Apps & Credentials**
3. Select **Sandbox** for testing or **Live** for production
4. Click **Create App**
5. Copy **Client ID** and **Secret**

---

## Step 3: Backend Configuration

### 3.1 Add Dependencies

Add to `backend/requirements.txt`:
```txt
stripe>=5.0.0
requests>=2.28.0
```

### 3.2 Environment Variables

Add to `backend/.env`:
```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...  # Use sk_live_... for production
STRIPE_PUBLISHABLE_KEY=pk_test_...  # Use pk_live_... for production
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_MODE=sandbox  # Change to 'live' for production
```

### 3.3 Register Payment Routes

Add to `backend/app/main.py`:
```python
from app.api.endpoints import payment_routes

# Register payment router
app.include_router(
    payment_routes.router,
    prefix="/api",
    tags=["payments"]
)
```

---

## Step 4: Frontend Configuration

### 4.1 Add Dependencies

Add to `frontend/package.json`:
```json
{
  "dependencies": {
    "@stripe/stripe-js": "^2.0.0",
    "@stripe/react-stripe-js": "^2.0.0",
    "@paypal/react-paypal-js": "^8.0.0"
  }
}
```

### 4.2 Environment Variables

Add to `frontend/.env.local`:
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_PAYPAL_CLIENT_ID=...
```

---

## Step 5: Deploy to VPS

### 5.1 Update Code
```bash
# On your local machine
cd /path/to/alsakr-online
git add .
git commit -m "Add payment integration"
git push origin main
```

### 5.2 Deploy on VPS
```bash
# SSH into VPS
ssh -i ~/.ssh/oracle_vps_key ubuntu@144.24.208.96

# Pull latest code
cd ~/alsakr-online
git pull origin main

# Update backend
cd infrastructure
docker compose build backend
docker compose up -d backend

# Install frontend dependencies and rebuild
docker compose build --no-cache frontend
docker compose up -d frontend
```

---

## Step 6: Database Migration

Run on VPS:
```bash
# Create payments table if not exists
docker exec -it alsakr-backend python -c "
from app.database import engine
from app.models.payment import Payment
from app.models.base import Base
Base.metadata.create_all(bind=engine)
"
```

---

## Step 7: Testing

### 7.1 Test Stripe (Sandbox)

Use Stripe test cards:
- **Success**: `4242 4242 4242 4242`
- **Requires Authentication**: `4000 0027 6000 3184`
- **Declined**: `4000 0000 0000 0002`

Expiry: Any future date  
CVC: Any 3 digits

### 7.2 Test PayPal (Sandbox)

1. Create test accounts at [developer.paypal.com/dashboard/accounts](https://developer.paypal.com/dashboard/accounts)
2. Use sandbox buyer account to test payments

### 7.3 Verify Webhooks

1. **Stripe**: Check webhook delivery in Stripe Dashboard
2. **PayPal**: Check webhook events in PayPal Developer Dashboard

---

## Step 8: Go Live

### 8.1 Switch to Production Keys

Update `.env` files:
```env
# Stripe Production
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

# PayPal Production
PAYPAL_MODE=live
```

### 8.2 Update Webhook URLs

Point webhooks to production URL:
- Stripe: `https://api.app.alsakronline.com/api/payments/stripe/webhook`
- PayPal: Configure in PayPal Developer Dashboard

### 8.3 Restart Services
```bash
docker compose restart backend frontend
```

---

## Verification Checklist

- [ ] Stripe test payment succeeds
- [ ] PayPal test payment succeeds
- [ ] Webhooks are received and processed
- [ ] Payment records created in database
- [ ] Order status updated after payment
- [ ] Email notifications sent (if n8n configured)
- [ ] Production keys configured
- [ ] SSL/HTTPS enabled for webhooks

---

## Troubleshooting

### Stripe Payment Fails
- Check API keys are correct
- Verify webhook signature
- Check logs: `docker compose logs backend | grep stripe`

### PayPal Order Creation Fails
- Verify Client ID and Secret
- Check PayPal mode (sandbox vs live)
- Check logs: `docker compose logs backend | grep paypal`

### Webhook Not Received
- Verify URL is publicly accessible
- Check firewall settings
- Test webhook manually in Stripe/PayPal dashboard

---

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all credentials
3. **Enable webhook signature verification** (already implemented)
4. **Use HTTPS only** for all payment endpoints
5. **Implement rate limiting** on payment endpoints
6. **Log all payment transactions** for audit trail

---

## Monitoring

Monitor payment metrics:
```bash
# View payment logs
docker compose logs -f backend | grep payment

# Check payment statistics
# Access via API: GET /api/admin/payment-stats
```

---

## Support

- **Stripe**: [support.stripe.com](https://support.stripe.com)
- **PayPal**: [paypal.com/us/smarthelp/contact-us](https://www.paypal.com/us/smarthelp/contact-us)
