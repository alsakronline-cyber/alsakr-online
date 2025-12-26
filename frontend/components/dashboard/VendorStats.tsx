"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, PieChart, BarChart3 } from "lucide-react";

export function VendorStats() {
    const [stats, setStats] = useState<any>({
        new_rfqs: 0,
        active_quotes: 0,
        acceptance_rate: 0,
        total_revenue: 0,
        currency: "USD",
        status_breakdown: { pending: 0, accepted: 0, rejected: 0 },
        revenue_trend: []
    });

    const [productsCount, setProductsCount] = useState(0);

    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

    useEffect(() => {
        if (userId) {
            fetchStats();
            fetchProducts();
        }
    }, [userId]);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.app.alsakronline.com'}/api/vendor/${userId}/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (!data.error) {
                setStats(data);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.app.alsakronline.com'}/api/catalog/products?vendor_id=${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setProductsCount(data.products?.length || 0);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 lg:grid-cols-5 gap-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-600">Open RFQs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.new_rfqs}</div>
                        <div className="text-xs text-zinc-500 mt-1">{stats.new_rfqs_change || "Active Requests"}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-600">My Quotes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.active_quotes}</div>
                        <div className="text-xs text-zinc-500 mt-1">Submitted Proposals</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-600">Win Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.acceptance_rate}%</div>
                        <div className="w-full bg-zinc-100 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${stats.acceptance_rate}%` }}></div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-green-50/50 dark:bg-green-900/10 border-green-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-600">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                            ${stats.total_revenue.toLocaleString()}
                        </div>
                        <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" /> Growth tracking active
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-600">Active Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{productsCount}</div>
                        <div className="text-xs text-zinc-500 mt-1">In your catalog</div>
                    </CardContent>
                </Card>
            </div>

            {/* Advanced Analytics Section */}
            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <PieChart className="h-4 w-4 text-indigo-600" />
                            Quote Status Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between gap-8 h-[200px]">
                            <div className="flex-1 flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                                        <span className="text-sm">Accepted</span>
                                    </div>
                                    <span className="text-sm font-bold">{stats.status_breakdown.accepted}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                        <span className="text-sm">Pending</span>
                                    </div>
                                    <span className="text-sm font-bold">{stats.status_breakdown.pending}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <span className="text-sm">Rejected</span>
                                    </div>
                                    <span className="text-sm font-bold">{stats.status_breakdown.rejected}</span>
                                </div>
                            </div>
                            <div className="relative w-[150px] h-[150px] flex items-center justify-center">
                                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#eee" strokeWidth="3" />
                                    {stats.active_quotes > 0 && (() => {
                                        const accepted = (stats.status_breakdown.accepted / stats.active_quotes) * 100;
                                        const pending = (stats.status_breakdown.pending / stats.active_quotes) * 100;
                                        const rejected = (stats.status_breakdown.rejected / stats.active_quotes) * 100;
                                        return (
                                            <>
                                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#4f46e5" strokeWidth="3" strokeDasharray={`${accepted}, 100`} />
                                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#eab308" strokeWidth="3" strokeDasharray={`${pending}, 100`} strokeDashoffset={`-${accepted}`} />
                                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#ef4444" strokeWidth="3" strokeDasharray={`${rejected}, 100`} strokeDashoffset={`-${accepted + pending}`} />
                                            </>
                                        )
                                    })()}
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-xl font-bold">{stats.active_quotes}</span>
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-tighter">Total Quotes</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <BarChart3 className="h-4 w-4 text-green-600" />
                            Revenue Trend (USD)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col justify-end gap-2 h-[200px] w-full px-4">
                            <div className="flex-1 flex items-end justify-between gap-2 pb-2">
                                {stats.revenue_trend.map((month: any, i: number) => {
                                    const maxRev = Math.max(...stats.revenue_trend.map((m: any) => m.revenue), 1000);
                                    const height = (month.revenue / maxRev) * 100;
                                    return (
                                        <div key={i} className="flex-1 group relative">
                                            <div className="bg-green-100 dark:bg-green-900/30 w-full rounded-t-sm transition-all hover:bg-green-500" style={{ height: `${height}%` }}>
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                                                    ${month.revenue.toLocaleString()}
                                                </div>
                                            </div>
                                            <div className="text-[10px] text-zinc-500 text-center mt-2">{month.name}</div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
