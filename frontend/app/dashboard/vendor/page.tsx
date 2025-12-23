"use client"

import { useEffect, useState } from "react"
import VendorSidebar from "./_components/VendorSidebar"
import VendorHeader from "./_components/VendorHeader"
import VendorKPICards from "./_components/VendorKPICards"
import RecentInquiriesTable from "./_components/RecentInquiriesTable"
import { fetchVendorStats, fetchVendorInquiries } from "@/lib/api"

export default function VendorDashboard() {
    const [stats, setStats] = useState(null)
    const [inquiries, setInquiries] = useState([])
    const [loading, setLoading] = useState(true)

    // Mock vendor ID for demo
    const VENDOR_ID = "vendor-123"

    useEffect(() => {
        async function loadData() {
            try {
                // Fetch in parallel
                const [statsData, inquiriesData] = await Promise.all([
                    fetchVendorStats(VENDOR_ID),
                    fetchVendorInquiries(VENDOR_ID)
                ])

                setStats(statsData)
                setInquiries(inquiriesData || [])
            } catch (err) {
                console.error("Failed to load dashboard data", err)
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [])

    return (
        <div className="flex h-screen bg-gray-900 text-white font-sans">
            <VendorSidebar />

            <main className="flex-1 overflow-auto bg-black/20">
                <VendorHeader />

                <div className="p-8 space-y-8">
                    {loading ? (
                        <div className="flex items-center justify-center p-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <>
                            <VendorKPICards stats={stats} />
                            <RecentInquiriesTable inquiries={inquiries} />
                        </>
                    )}
                </div>
            </main>
        </div>
    )
}
