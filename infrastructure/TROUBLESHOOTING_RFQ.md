# RFQ System Troubleshooting Guide

## Issue: No RFQs Displayed in Dashboards

### Problem Description
- Buyer Dashboard "My RFQs" tab shows empty list
- Vendor Dashboard "Marketplace" shows no open RFQs
- Backend logs show successful API calls with 200 OK responses
- RFQs are being created successfully in the database

### Root Cause
The `RFQContext.tsx` is calling the wrong API endpoint. It's calling `/api/rfqs` without user/role-specific query parameters.

**Current Implementation (Incorrect):**
```typescript
// Line 60 in frontend/context/RFQContext.tsx
const res = await fetch(`${apiUrl}/api/rfqs`, {
    headers: { Authorization: `Bearer ${token}` }
});
```

**Expected Behavior:**
- **Buyers** should call: `/api/rfqs?buyer_id={userId}`
- **Vendors** should call: `/api/vendor/{vendorId}/rfqs` (for open RFQs)

### Solution

The `fetchRFQs` function needs to be updated to include user-specific parameters based on the role.

#### Option 1: Quick Fix (Query Parameters)
Update `frontend/context/RFQContext.tsx` to pass buyer_id or vendor_id:

```typescript
const fetchRFQs = async (role: string) => {
    if (!token) return;
    setLoading(true);
    try {
        const userId = localStorage.getItem('userId');
        let url = `${apiUrl}/api/rfqs`;
        
        if (role === 'buyer' || role === 'both') {
            url += `?buyer_id=${userId}`;
        } else if (role === 'vendor') {
            url = `${apiUrl}/api/vendor/${userId}/rfqs`;
        }
        
        const res = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            setRfqs(data.rfqs || data); // Handle different response formats
        }
    } catch (err) {
        console.error("Failed to fetch RFQs", err);
    } finally {
        setLoading(false);
    }
};
```

#### Option 2: Backend Fix (Token-Based)
Alternatively, update the backend `/api/rfqs` endpoint to automatically filter by the authenticated user from the token:

```python
# In backend/app/api/endpoints/rfq_routes.py
@router.get("/rfqs")
async def get_rfqs(current_user: dict = Depends(get_current_user)):
    user_id = current_user["sub"]
    user_role = current_user.get("role", "buyer")
    
    if user_role == "buyer":
        # Return RFQs created by this buyer
        rfqs = db.query(RFQ).filter(RFQ.buyer_id == user_id).all()
    elif user_role == "vendor":
        # Return open RFQs for vendors
        rfqs = db.query(RFQ).filter(RFQ.status == "open").all()
    
    return {"rfqs": rfqs}
```

### Verification Steps

After applying the fix:

1. **Clear Browser Cache** and reload
2. **Login as Buyer**:
   - Navigate to `/dashboard/buyer`
   - Switch to "My RFQs" tab
   - You should see created RFQs in the table

3. **Login as Vendor**:
   - Navigate to `/dashboard/vendor`
   - Check "Marketplace" tab
   - You should see open RFQs in card grid

4. **Check Browser Console**:
   ```javascript
   // Should see requests like:
   // GET /api/rfqs?buyer_id=xxx (for buyers)
   // GET /api/vendor/xxx/rfqs (for vendors)
   ```

5. **Backend Logs**:
   ```bash
   docker compose logs -f backend | grep rfqs
   # Should show 200 OK responses with correct endpoints
   ```

### Additional Notes

- The backend is already returning data correctly (seen in logs with 200 OK)
- The issue is purely in the frontend data fetching logic
- RFQ creation works fine (`POST /api/rfqs` successful)
- The `userId` needs to be retrieved from localStorage or AuthContext

### Quick Test Command

To verify RFQs exist in the database via the VPS:

```bash
# SSH into VPS
ssh -i ~/.ssh/oracle_vps_key ubuntu@144.24.208.96

# Check backend logs for RFQ creation
cd ~/alsakr-online/infrastructure
docker compose logs backend | grep "POST /api/rfqs"

# You should see successful RFQ creation like:
# INFO: "POST /api/rfqs HTTP/1.1" 200 OK
```
