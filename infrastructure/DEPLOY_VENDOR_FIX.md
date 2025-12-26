# Quick Deploy: Vendor Marketplace Fix

## What Was Fixed
Added status transformation in `RFQContext.tsx` to handle backend returning `"New"` instead of `"open"`.

## Deploy Commands

Run these commands in order:

### Step 1: Commit Changes Locally
```bash
cd c:\Users\pc shop\Downloads\alsakr-online\frontend
git add context/RFQContext.tsx
git commit -m "Fix vendor marketplace: Transform status values"
git push origin main
```

### Step 2: Deploy to VPS

In your SSH terminal (already connected):

```bash
cd ~/alsakr-online
git pull origin main
cd infrastructure
docker compose build frontend
docker compose up -d frontend
```

## Test Results

After deployment:

1. **Login as Vendor**: `alsakronline@gmail.com` / `#Anas231#`
2. **Go to** `/dashboard/vendor`
3. **Click** "Marketplace" tab
4. **You should see**: The 2 open RFQs ("sl" and "Sensor")

## Expected Behavior

✅ Buyer Dashboard shows RFQs  
✅ Vendor Marketplace shows open RFQs  
✅ Vendor can click "View & Quote" to submit quotes  

---

**Total time**: ~2-3 minutes
