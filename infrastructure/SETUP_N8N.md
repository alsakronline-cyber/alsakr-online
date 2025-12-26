# n8n Automation Setup Guide

## Overview
Set up n8n for automated workflows including order notifications, payment confirmations, and RFQ reminders.

---

## Step 1: n8n Installation

n8n is already configured in `docker-compose.yml`. Verify the configuration:

```yaml
n8n:
  image: n8nio/n8n:latest
  container_name: alsakr-n8n
  restart: unless-stopped
  ports:
    - "5678:5678"
  environment:
    - N8N_BASIC_AUTH_ACTIVE=true
    - N8N_BASIC_AUTH_USER=admin
    - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
    - N8N_HOST=${N8N_HOST:-n8n.app.alsakronline.com}
    - WEBHOOK_URL=${N8N_WEBHOOK_URL:-https://n8n.app.alsakronline.com}
  volumes:
    - ./n8n/workflows:/home/node/.n8n
    - ./n8n/templates:/data/templates
  networks:
    - alsakr-network
```

---

## Step 2: Environment Configuration

Add to `infrastructure/.env`:
```env
# n8n Configuration
N8N_PASSWORD=your_secure_password
N8N_HOST=n8n.app.alsakronline.com
N8N_WEBHOOK_URL=https://n8n.app.alsakronline.com
```

Add to `backend/.env`:
```env
# n8n Integration
N8N_WEBHOOK_URL=http://n8n:5678/webhook
```

---

## Step 3: Start n8n

```bash
cd ~/alsakr-online/infrastructure
docker compose up -d n8n
```

---

## Step 4: Access n8n UI

1. Open browser: `https://n8n.app.alsakronline.com`
2. Login with credentials:
   - Username: `admin`
   - Password: (from `N8N_PASSWORD` env var)

---

## Step 5: Import Workflows

### 5.1 Order Notification Workflow

1. In n8n UI, click **Add workflow** → **Import from file**
2. Select `infrastructure/n8n/workflows/order-notification.json`
3. Click **Activate** workflow

**Webhook URL**: `https://n8n.app.alsakronline.com/webhook/order-created`

### 5.2 Payment Confirmation Workflow

1. Import `infrastructure/n8n/workflows/payment-confirmation.json`
2. Activate workflow

**Webhook URL**: `https://n8n.app.alsakronline.com/webhook/payment-confirmed`

### 5.3 RFQ Reminder Workflow

1. Import `infrastructure/n8n/workflows/rfq-response-reminder.json`
2. Configure schedule (default: Daily at 9 AM)
3. Activate workflow

---

## Step 6: Configure Email Credentials

### 6.1 SMTP Setup

1. In n8n, go to **Credentials** → **Create New**
2. Select **SMTP**
3. Configure:
   ```
   Host: smtp.gmail.com (or your SMTP server)
   Port: 587
   User: your-email@gmail.com
   Password: your-app-password
   ```

### 6.2 Update Workflow Nodes

Replace email nodes in workflows with your SMTP credentials.

---

## Step 7: Test Workflows

### 7.1 Test Order Notification

Send test webhook:
```bash
curl -X POST https://n8n.app.alsakronline.com/webhook/order-created \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "test-123",
    "buyer_email": "buyer@test.com",
    "buyer_name": "Test Buyer",
    "vendor_email": "vendor@test.com",
    "vendor_name": "Test Vendor",
    "total_price": 100.00,
    "items": [
      {"name": "Test Product", "quantity": 2, "price": 50.00}
    ]
  }'
```

### 7.2 Test Payment Confirmation

```bash
curl -X POST https://n8n.app.alsakronline.com/webhook/payment-confirmed \
  -H "Content-Type: application/json" \
  -d '{
    "payment_id": "pay-123",
    "order_id": "order-123",
    "amount": 100.00,
    "currency": "USD",
    "buyer_email": "buyer@test.com",
    "payment_method": "card"
  }'
```

---

## Step 8: Backend Integration

The n8n service is already created at `backend/app/services/n8n_service.py`.

### 8.1 Trigger from Order Creation

In `backend/app/api/endpoints/order_routes.py`, add:
```python
from app.services.n8n_service import N8NService

@router.post("/orders")
async def create_order(...):
    # ... create order logic ...
    
    # Trigger n8n notification
    await N8NService.trigger_order_notification({
        "order_id": order.id,
        "buyer_email": buyer.email,
        "buyer_name": buyer.full_name,
        "vendor_email": vendor.email,
        "vendor_name": vendor.company_name,
        "total_price": order.total_price,
        "items": order.items
    })
```

### 8.2 Trigger from Payment Success

In `backend/app/api/endpoints/payment_routes.py`:
```python
@router.post("/payments/stripe/webhook")
async def stripe_webhook(...):
    if event["type"] == "payment_intent.succeeded":
        # ... update payment ...
        
        # Trigger n8n notification
        await N8NService.trigger_payment_confirmation({
            "payment_id": payment.id,
            "order_id": payment.order_id,
            "amount": payment.amount,
            "currency": payment.currency,
            "buyer_email": buyer.email,
            "payment_method": "card"
        })
```

---

## Step 9: Configure Caddy for n8n

Add to `infrastructure/Caddyfile`:
```
n8n.app.alsakronline.com {
    reverse_proxy n8n:5678
}
```

Reload Caddy:
```bash
docker compose restart caddy
```

---

## Step 10: Monitoring

### View Workflow Executions
1. In n8n UI, go to **Executions**
2. Check success/failure status
3. Debug failed executions

### Check Logs
```bash
docker compose logs -f n8n
```

---

## Workflow Templates

### Order Confirmation Email Template

Located at: `infrastructure/n8n/templates/order-confirmation.html`

Variables:
- `{{ buyer_name }}`
- `{{ order_id }}`
- `{{ total_price }}`
- `{{ items }}`

### Payment Receipt Template

Located at: `infrastructure/n8n/templates/payment-receipt.html`

Variables:
- `{{ buyer_name }}`
- `{{ payment_id }}`
- `{{ amount }}`
- `{{ payment_method }}`

---

## Advanced Configuration

### Custom Workflows

Create custom workflows for:
- Order shipping notifications
- Low stock alerts
- Customer feedback requests
- Abandoned cart reminders

### Integrations

n8n supports 200+ integrations:
- Slack notifications
- SMS via Twilio
- Google Sheets logging
- Webhook triggers

---

## Troubleshooting

### Workflow Not Triggering
- Check webhook URL is correct
- Verify n8n container is running
- Check backend logs for n8n service errors

### Email Not Sending
- Verify SMTP credentials
- Check email node configuration
- Test SMTP connection

### Webhook 404 Error
- Ensure workflow is activated
- Check webhook path matches
- Verify Caddy reverse proxy

---

## Security

1. **Use strong password** for n8n UI
2. **Restrict access** to n8n port (5678)
3. **Use HTTPS** for webhook URLs
4. **Rotate credentials** regularly

---

## Backup

Backup n8n workflows:
```bash
cp -r infrastructure/n8n/workflows /backup/n8n-workflows-$(date +%Y%m%d)
```

---

## Resources

- [n8n Documentation](https://docs.n8n.io)
- [n8n Community](https://community.n8n.io)
- [Workflow Templates](https://n8n.io/workflows)
