# Deploying Phase 2: RFQ System

This guide outlines the steps to deploy the newly implemented RFQ System (Buyer & Vendor Dashboards) to your Oracle Cloud VPS.

## Prerequisites
- SSH access to your VPS.
- `alsakr-online` repository cloned on the VPS.

## Deployment Steps

### 1. Update Codebase
Navigate to your project directory and pull the latest changes.
```bash
cd ~/alsakr-online
git pull origin main
```

### 2. Rebuild Frontend Container
Since we added new dependencies (`date-fns`) and created new components, we must rebuild the frontend image.

```bash
cd infrastructure
docker compose build frontend
```

### 3. Restart Services
Restart the frontend service to apply changes.
```bash
docker compose up -d frontend
```
*Note: This will perform a rolling restart if configured, or simply recreate the container.*

### 4. Verify Deployment
Check the logs to ensure the frontend started correctly.
```bash
docker compose logs -f frontend
```

## Troubleshooting

> [!IMPORTANT]
> **Build Error: "Module not found: Can't resolve 'date-fns'"**
> If you see this error, it means the dependency wasn't pushed to the repository.
>
> 1.  **On your local machine**:
>     ```bash
>     cd frontend
>     npm install date-fns --save
>     git add package.json package-lock.json
>     git commit -m "Add date-fns"
>     git push origin main
>     ```
> 2.  **On the VPS**:
>     ```bash
>     git pull origin main
>     docker compose build --no-cache frontend
>     docker compose up -d frontend
>     ```

- **Frontend not updating?**
  Force a rebuild without cache if changes aren't visible:
  ```bash
  docker compose build --no-cache frontend
  docker compose up -d frontend
  ```

## Verification Checklist

After successful deployment, verify the RFQ system is working correctly:

### 1. Access the Application
Navigate to your application URL: `https://app.alsakronline.com`

### 2. Test Buyer Dashboard

1. **Login as Buyer**:
   - Use a test buyer account or create one
   - Navigate to `/dashboard/buyer`

2. **Verify Search Parts Tab**:
   - Check that the search input is visible
   - Try searching for a part (e.g., "sensor")
   - Verify search results display correctly
   - Click "View" on a part to open the ProductDetailsPanel
   - Test the "Request Quote" button

3. **Verify My RFQs Tab**:
   - Switch to the "My RFQs" tab
   - Verify the tab switches correctly
   - Check if any existing RFQs are displayed
   - Try creating a new RFQ from the search results

### 3. Test Vendor Dashboard

1. **Login as Vendor**:
   - Use a test vendor account
   - Navigate to `/dashboard/vendor`

2. **Verify Marketplace Tab**:
   - Check that open RFQs are displayed
   - Click "Submit Quote" on an RFQ
   - Verify the QuoteForm displays correctly
   - Fill out the form (price, delivery time, notes)
   - Submit the quote

3. **Verify My Quotes Tab**:
   - Switch to the "My Quotes" tab
   - Verify submitted quotes are listed
   - Check quote status displays (Pending/Accepted/Rejected)

4. **Verify Statistics Tab**:
   - Switch to the "Statistics" tab
   - Verify analytics cards display correctly
   - Check for any console errors

### 4. Check Console and Network

1. **Browser Console**:
   - Open Developer Tools (F12)
   - Check for JavaScript errors
   - Verify no 404 errors for missing resources

2. **Network Tab**:
   - Monitor API calls to `/api/rfqs` and `/api/quotes`
   - Verify successful responses (200 status codes)
   - Check that data is being fetched correctly

### 5. Server Logs

If you encounter issues, check the container logs:

```bash
# Frontend logs
docker compose logs -f frontend

# Backend logs
docker compose logs -f backend
```

## Success Criteria

✅ Both dashboards load without errors  
✅ Tab navigation works smoothly  
✅ RFQs can be created and viewed  
✅ Quotes can be submitted and tracked  
✅ No console errors or failed API requests  

## Common Issues Resolved During Deployment

1. **Missing `date-fns` dependency**: Added to `package.json`
2. **TypeScript errors in BuyerDashboard**: Added missing state variables
3. **Missing ProductDetailsPanel**: Created new component
4. **Invalid import in QuoteForm**: Removed non-existent `useInputState` hook

- **API Errors?**
  Ensure the backend is running and `NEXT_PUBLIC_API_URL` is correctly set in your `infrastructure/docker-compose.yml` (environment variables).
