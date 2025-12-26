# Troubleshooting Guide

## Authentication Issues

### "Signature has expired" Error

**Symptoms:**
- You see `Signature has expired` in the backend logs.
- API requests return `401 Unauthorized` or `403 Forbidden`.
- The dashboard might look broken or empty.

**Cause:**
The JWT (JSON Web Token) stored in your browser has expired. This happens because the default security setting was set to invalidate tokens after 30 minutes.

**Solution:**
1.  **Log Out**: Click the "Log Out" button in the application.
2.  **Clear Storage (If stuck)**: If you cannot find the logout button or the page is unresponsive:
    - Open Developer Tools (F12).
    - Go to the **Application** tab.
    - Expand **Local Storage** in the left sidebar.
    - Right-click your site domain and select **Clear**.
    - Refresh the page.
3.  **Log In Again**: Enter your credentials to generate a new, valid token.

**Prevention:**
We have updated the backend configuration to set the token expiration to **24 hours** (`1440 minutes`). To apply this change:

1.  Pull the latest changes:
    ```bash
    git pull origin main
    ```
2.  Rebuild the backend container:
    ```bash
    docker compose up -d --build backend
    ```

## Docker Build Issues

### "Connection reset" or "Timeout" during `pip install`

**Solution:**
This usually happens due to network instability between the VPS and PyPI.
1.  **Retry the build**: Often simply running the command again works.
2.  **Increase Timeout**: We have updated the `Dockerfile` to use a longer timeout for pip.
    ```dockerfile
    RUN pip install --default-timeout=1000 --no-cache-dir --user -r requirements.txt
    ```

## Database Issues

### "Relation does not exist" or "No such column"

**Solution:**
This means your database schema is out of sync with the code.
1.  **Run Migrations**:
    ```bash
    docker compose exec backend alembic upgrade head
    ```
2.  **Reset Database (If stuck in development)**:
    *Caution: This deletes all data.*
    ```bash
    rm backend/data/nexus.db
    docker compose restart backend
    # The app will recreate the DB on startup if configured, or run migrations again.
    ```
