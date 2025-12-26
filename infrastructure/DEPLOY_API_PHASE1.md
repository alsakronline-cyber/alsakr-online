# Deploying Phase 1 API Changes (Cart & Order Logic)

This guide covers deploying the new **Cart API** and **Checkout Logic**.

**Prerequisites:**
*   You have completed `DEPLOY_SCHEMA_PHASE1.md` and verified the database schema.

## Deployment Steps

1.  **SSH into VPS:**
    ```bash
    ssh -i ~/.ssh/oracle_vps_key ubuntu@144.24.208.96
    ```

2.  **Navigate to Project:**
    ```bash
    cd alsakr-online/infrastructure
    ```

3.  **Pull Latest Code:**
    ```bash
    cd ..
    git pull origin main
    cd infrastructure
    ```

4.  **Rebuild Backend:**
    *   This is required to update the code inside the running container (endpoints/cart.py, routes/order_routes.py).
    ```bash
    docker compose up -d --build backend
    ```

5.  **Restart Frontend (Optional):**
    *   If any frontend changes were made (none yet in this phase, but good practice).
    ```bash
    docker compose restart frontend
    ```

## Verification
You can verify the new endpoints are active by checking the Swagger UI docs (if exposed) or using curl.

**Check Cart Endpoint:**
*(Requires Auth Token)*
```bash
# Get a token first (simulated) or check logs for healthy startup
docker compose logs backend --tail 20
```
*   Look for "Application startup complete".
