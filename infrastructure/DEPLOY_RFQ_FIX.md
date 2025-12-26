# Deploying RFQ Display Fix

This guide explains how to deploy the fix for the RFQ display issue where buyer and vendor dashboards show empty lists.

## Problem Summary
- **Symptom**: No RFQs displayed in Buyer Dashboard "My RFQs" or Vendor Dashboard "Marketplace"
- **Root Cause**: `RFQContext.tsx` was not passing user IDs in API requests
- **Fix Applied**: Updated fetch logic to include `buyer_id` or use vendor-specific endpoint

## Files Changed
- `frontend/context/RFQContext.tsx` - Updated `fetchRFQs()` function

## Current Progress Status

✅ **Step 1 Complete**: Changes committed locally (commit: "Market")  
✅ **Step 2 Complete**: Changes pushed to GitHub (`c23b722`)  
✅ **Connected to VPS**: SSH session active  
⏳ **Next**: Pull changes and rebuild frontend on VPS

## Deployment Steps

### ✅ 1. Commit Changes Locally (DONE)

```bash
cd c:\Users\pc shop\Downloads\alsakr-online\frontend
git add context/RFQContext.tsx
git commit -m "Market"
git push origin main
```

### ⏳ 2. Deploy to VPS (IN PROGRESS)

You're already connected to the VPS. Now run these commands:

**Pull latest changes:**
```bash
cd ~/alsakr-online
git pull origin main
```

**Rebuild and restart frontend:**
```bash
cd infrastructure
docker compose build frontend
docker compose up -d frontend
```

### 3. Verify the Fix

#### Browser Testing

1. **Login as Buyer** (e.g., `mohamed.el.sdiek@gmail.com`):
   - Navigate to `/dashboard/buyer`
   - Switch to "My RFQs" tab
   - You should now see the RFQ created earlier (Title: "Sensor", Qty: 6)

2. **Login as Vendor** (e.g., `alsakronline@gmail.com`):
   - Navigate to `/dashboard/vendor`
   - Check "Marketplace" tab
   - You should see open RFQs available for quoting

#### Backend Logs Check

Monitor the backend logs to see correct API calls:

```bash
# In VPS terminal
cd ~/alsakr-online/infrastructure
docker compose logs -f backend | grep rfqs
```

**Expected output:**
```
INFO: "GET /api/rfqs?buyer_id=xxx HTTP/1.1" 200 OK
INFO: "GET /api/vendor/yyy/rfqs HTTP/1.1" 200 OK
```

#### Browser Console Check

Open browser DevTools (F12) → Network tab:
- Filter by "rfqs"
- Verify requests include query parameters:
  - Buyers: `GET /api/rfqs?buyer_id=36b3d35f-9daf-4103-8898-f5c63907b976`
  - Vendors: `GET /api/vendor/fcec04e7-73b4-4e25-827e-2dbf1d14136a/rfqs`

### 4. Test End-to-End Flow

1. **Create New RFQ** (as Buyer):
   - Go to "Search Parts" tab
   - Click "Request Quote" on a search result
   - Fill out the RFQ form
   - Submit

2. **Verify in My RFQs**:
   - Switch to "My RFQs" tab
   - New RFQ should appear in the list immediately

3. **Submit Quote** (as Vendor):
   - Login as vendor
   - Go to "Marketplace"
   - Click "View & Quote" on an open RFQ
   - Fill out quote form (price, delivery time, notes)
   - Submit

4. **Verify Quote** (as Buyer):
   - Login as buyer
   - Go to "My RFQs"
   - Click on the RFQ that received a quote
   - Quotes should be visible in the details view

## Troubleshooting

### Issue: Still seeing empty lists after deployment

**Solution 1 - Clear Browser Cache:**
```
1. Open browser DevTools (F12)
2. Right-click on refresh button
3. Select "Empty Cache and Hard Reload"
```

**Solution 2 - Check localStorage:**
```javascript
// In browser console
console.log('userId:', localStorage.getItem('userId'));
console.log('token:', localStorage.getItem('token'));
console.log('userRole:', localStorage.getItem('userRole'));
```

If any are null, logout and login again.

**Solution 3 - Verify userid in database:**
```bash
# SSH into VPS
ssh -i ~/.ssh/oracle_vps_key ubuntu@144.24.208.96

# Check backend logs for user registration
cd ~/alsakr-online/infrastructure
docker compose logs backend | grep "POST /api/auth/register"
docker compose logs backend | grep "POST /api/auth/login"
```

### Issue: Frontend not updating

Force rebuild without cache:
```bash
cd ~/alsakr-online/infrastructure
docker compose build --no-cache frontend
docker compose up -d frontend
```

### Issue: 403 Forbidden errors

Token has expired. Logout and login again.

## Rollback Instructions

If the fix causes issues, rollback:

```bash
# On VPS
cd ~/alsakr-online
git log --oneline  # Find the previous commit hash
git reset --hard <previous-commit-hash>
cd infrastructure
docker compose build frontend
docker compose up -d frontend
```

## Success Criteria

✅ Buyer Dashboard shows list of RFQs created by that buyer  
✅ Vendor Dashboard shows all open RFQs in marketplace  
✅ API requests include correct user IDs  
✅ No 403 or 404 errors in browser console  
✅ Backend logs show 200 OK responses  

## Notes

- The fix retrieves `userId` from `localStorage` which is set during login
- Different endpoints used for buyers vs vendors:
  - Buyers: `/api/rfqs?buyer_id={id}`
  - Vendors: `/api/vendor/{id}/rfqs`
- The response format handling accounts for different backend response structures
