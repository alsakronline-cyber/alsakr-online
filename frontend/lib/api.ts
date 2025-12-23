const API_BASE_url = "/api"; // Relative path handles both dev (with proxy) and prod

export async function fetchVendorStats(vendorId: string) {
    try {
        const res = await fetch(`${API_BASE_url}/dashboard/vendor/${vendorId}/stats`);
        if (!res.ok) throw new Error("Failed to fetch stats");
        return await res.json();
    } catch (error) {
        console.error("Error fetching vendor stats:", error);
        return null;
    }
}

export async function fetchVendorInquiries(vendorId: string) {
    try {
        const res = await fetch(`${API_BASE_url}/dashboard/vendor/${vendorId}/inquiries`);
        if (!res.ok) throw new Error("Failed to fetch inquiries");
        return await res.json();
    } catch (error) {
        console.error("Error fetching vendor inquiries:", error);
        return [];
    }
}
