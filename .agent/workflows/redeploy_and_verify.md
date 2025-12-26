---
description: Redeploy application and verify authentication fixes
---

# Redeploy and Verify Authentication Fixes

This workflow ensures the latest frontend and backend changes are correctly deployed and cached javascript is cleared.

1. Connect to VPS
// turbo
2. Navigate to project directory
```bash
cd ~/alsakr-online
```

3. Update Codebase
```bash
git pull origin main
```

4. Rebuild and Restart Services
```bash
cd infrastructure
docker compose down
docker compose up -d --build
```
> [!NOTE]
> The `--build` flag is critical to ensure the frontend image is updated with the new `token` retrieval logic.

5. Verify Backend Status
```bash
docker compose logs -f backend
```
Wait until you see "Application startup complete".

6. Client-Side Verification
> [!IMPORTANT]
> - Go to the alsakr-online website.
> - **Logout** completely.
> - **Clear Browser Cache** or Hard Refresh (`Ctrl+Shift+R` or `Cmd+Shift+R`).
> - **Login** again.
> - Navigate to Buyer/Vendor Dashboard.
> - Verify that RFQs and Notifications load without errors.
