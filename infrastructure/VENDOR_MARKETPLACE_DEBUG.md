# Vendor Marketplace Issue - Debug Guide

## Issue Summary
- **Buyer Dashboard**: ✅ Shows RFQs correctly
- **Vendor Stats**: ✅ Shows "2 Open RFQs"  
- **Vendor Marketplace**: ❌ Shows "No open RFQs found"

## Root Cause Analysis

The backend endpoint `/api/vendor/{vendor_id}/rfqs` is returning data, but there's a mismatch:

### Backend Response Format
```python
# File: backend/app/api/dashboard_routes.py line 84-111
@router.get("/vendor/{vendor_id}/rfqs")
def get_vendor_rfqs(...):
    rfqs = db.query(RFQ).filter(RFQ.status != "closed").all()
    
    result = []
    for rfq in rfqs:
        has_quoted = db.query(Quote).filter(...).first()
        result.append({
            "id": rfq.id,
            "title": rfq.title,
            "description": rfq.description or "No description",
            "quantity": rfq.quantity,
            "status": "Quoted" if has_quoted else "New",  # ⚠️ Returns "New" or "Quoted"
            "created_at": rfq.created_at.isoformat()
        })
    
    return result  # Returns array directly
```

### Frontend Expectation
```typescript
// File: frontend/context/RFQContext.tsx
export interface RFQ {
    status: "open" | "quoted" | "closed" | "cancelled";  // ⚠️ Expects "open" not "New"
}
```

**Problem**: Backend returns `status: "New"` but frontend expects `status: "open"`.

## Debugging Steps

### 1. Check Browser Console Logs

Open browser DevTools (F12) and check Console tab for:

```javascript
console.log('RFQs fetched:', rfqs);
```

Look for the actual data being set.

### 2. Check Network Tab

In DevTools → Network:
1. Filter by "rfqs"
2. Find request to `/api/vendor/{id}/rfqs`
3. Click on it
4. Check "Response" tab
5. Verify the response format

**Expected response:**
```json
[
  {
    "id": "...",
    "title": "Sensor",
    "status": "New",  // This is the issue
    "quantity": 6,
    ...
  }
]
```

### 3. Temporary Frontend Fix

Add console logging to `RFQContext.tsx`:

```typescript
if (res.ok) {
    const data = await res.json();
    console.log('Vendor RFQs raw response:', data);
    console.log('Is array?:', Array.isArray(data));
    const rfqsData = Array.isArray(data) ? data : (data.rfqs || []);
    console.log('RFQs to set:', rfqsData);
    setRfqs(rfqsData);
}
```

## Solution Options

### Option 1: Fix Backend (Recommended)

Update backend to return "open" instead of "New":

```python
# In backend/app/api/dashboard_routes.py
result.append({
    "id": rfq.id,
    "title": rfq.title,
    "description": rfq.description or "No description",
    "quantity": rfq.quantity,
    "status": rfq.status,  # Use actual DB status instead of computed "New"/"Quoted"
    "created_at": rfq.created_at.isoformat(),
    "has_quoted": bool(has_quoted)  # Add this as separate field
})
```

### Option 2: Fix Frontend Type

Update frontend to accept "New" and "Quoted":

```typescript
export interface RFQ {
    status: "open" | "quoted" | "closed" | "cancelled" | "New" | "Quoted";
}
```

### Option 3: Transform Data in Frontend

Add transformation in RFQContext:

```typescript
if (res.ok) {
    const data = await res.json();
    const rawRfqs = Array.isArray(data) ? data : (data.rfqs || []);
    
    // Transform status values
    const transformedRfqs = rawRfqs.map(rfq => ({
        ...rfq,
        status: rfq.status === "New" ? "open" : rfq.status.toLowerCase()
    }));
    
    setRfqs(transformedRfqs);
}
```

## Quick Test Command

To verify backend is returning data:

```bash
# SSH into VPS
ssh -i ~/.ssh/oracle_vps_key ubuntu@144.24.208.96

# Get vendor ID from earlier logs (e.g., alsakronline@gmail.com vendor)
# fcec04e7-73b4-4e25-827e-2dbf1d14136a or e70daf90-fc87-4917-9faf-6b842ed89ca9

# Test the endpoint directly
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.app.alsakronline.com/api/vendor/fcec04e7-73b4-4e25-827e-2dbf1d14136a/rfqs
```

## Recommended Action

**Option 3 (Transform in Frontend)** is the quickest fix without backend changes.

Add this transformation to `frontend/context/RFQContext.tsx` around line 81-84.
