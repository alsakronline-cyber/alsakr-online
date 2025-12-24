"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, FileText, ShoppingCart, DollarSign, Activity, Settings, LayoutDashboard } from "lucide-react"
import { NotificationBell } from "@/components/NotificationBell"

export default function AdminDashboardPage() {
    const router = useRouter()
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.app.alsakronline.com'}/api/admin/stats`)
            const data = await res.json()
            setStats(data)
        } catch (error) {
            console.error("Failed to fetch admin stats:", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="p-8">Loading stats...</div>

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Admin Control Center</h1>
                        <p className="text-zinc-500">Platform-wide overview and management</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <NotificationBell />
                        <Button variant="outline" onClick={() => router.push('/dashboard/admin/users')}>
                            <Users className="h-4 w-4 mr-2" />
                            Manage Users
                        </Button>
                    </div>
                </div>

                {/* KPI Overview */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-zinc-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.total_users || 0}</div>
                            <p className="text-xs text-zinc-500">
                                {stats?.active_vendors} Vendors • {stats?.active_buyers} Buyers
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total RFQs</CardTitle>
                            <FileText className="h-4 w-4 text-zinc-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.total_rfqs || 0}</div>
                            <p className="text-xs text-zinc-500">Open inquiries platform-wide</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-zinc-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.total_orders || 0}</div>
                            <p className="text-xs text-zinc-500">Successful fulfillments</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-indigo-50/50 dark:bg-indigo-900/10">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-indigo-600">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-indigo-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">
                                ${stats?.total_revenue?.toLocaleString() || 0}
                            </div>
                            <p className="text-xs text-indigo-500">Aggregate platform transaction volume</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Management Quick Links */}
                <div className="grid md:grid-cols-2 gap-6">
                    <Card className="hover:border-indigo-500/50 transition-colors cursor-pointer" onClick={() => router.push('/dashboard/admin/users')}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-indigo-600" />
                                User Management
                            </CardTitle>
                            <CardDescription>Control roles, verify vendors, and manage account statuses.</CardDescription>
                        </CardHeader>
                    </Card>
                    <Card className="hover:border-indigo-500/50 transition-colors cursor-pointer" onClick={() => router.push('/dashboard/scrape/sick')}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-green-600" />
                                Scraper Controls
                            </CardTitle>
                            <CardDescription>Monitor and trigger catalog synchronization for major brands.</CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            </div>
        </div>
    )
}


