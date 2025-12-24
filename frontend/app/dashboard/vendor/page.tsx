"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileText, DollarSign, Package, TrendingUp, LayoutDashboard, Eye, Activity, BarChart3, PieChart } from "lucide-react"
import { NotificationBell } from "@/components/NotificationBell"
import { DashboardSwitcher } from "@/components/DashboardSwitcher"

export default function EnhancedVendorPage() {
    const router = useRouter()
    const [rfqs, setRfqs] = useState<any[]>([])
    const [quotes, setQuotes] = useState<any[]>([])
    const [products, setProducts] = useState<any[]>([])
    const [showQuoteForm, setShowQuoteForm] = useState(false)
    const [isEditingQuote, setIsEditingQuote] = useState(false)
    const [selectedRFQ, setSelectedRFQ] = useState<any>(null)
    const [selectedQuote, setSelectedQuote] = useState<any>(null)
    const [stats, setStats] = useState<any>({
        new_rfqs: 0,
        active_quotes: 0,
        acceptance_rate: 0,
        total_revenue: 0,
        currency: "USD",
        status_breakdown: { pending: 0, accepted: 0, rejected: 0 },
        revenue_trend: []
    })
    const [quoteForm, setQuoteForm] = useState({
        price: "",
        deliveryTime: "",
        notes: ""
    })

    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null

    useEffect(() => {
        if (userId) {
            fetchOpenRFQs()
            fetchMyQuotes()
            fetchProducts()
            fetchStats()
        }
    }, [userId])

    const fetchStats = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.app.alsakronline.com'}/api/vendor/${userId}/stats`)
            const data = await res.json()
            if (!data.error) {
                setStats(data)
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error)
        }
    }

    const fetchOpenRFQs = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.app.alsakronline.com'}/api/vendor/${userId}/rfqs`)
            const data = await res.json()
            setRfqs(data || [])
        } catch (error) {
            console.error('Failed to fetch RFQs:', error)
        }
    }

    const fetchMyQuotes = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.app.alsakronline.com'}/api/quotes?vendor_id=${userId}`)
            const data = await res.json()
            setQuotes(data.quotes || [])
        } catch (error) {
            console.error('Failed to fetch quotes:', error)
        }
    }

    const fetchProducts = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.app.alsakronline.com'}/api/catalog/products?vendor_id=${userId}`)
            const data = await res.json()
            setProducts(data.products || [])
        } catch (error) {
            console.error('Failed to fetch products:', error)
        }
    }

    const handleSubmitQuote = async () => {
        if (!selectedRFQ && !isEditingQuote) return

        try {
            const url = isEditingQuote
                ? `${process.env.NEXT_PUBLIC_API_URL || 'https://api.app.alsakronline.com'}/api/quotes/${selectedQuote.id}`
                : `${process.env.NEXT_PUBLIC_API_URL || 'https://api.app.alsakronline.com'}/api/quotes`

            const method = isEditingQuote ? 'PUT' : 'POST'
            const body = isEditingQuote
                ? JSON.stringify({
                    price: quoteForm.price,
                    delivery_time: quoteForm.deliveryTime,
                    notes: quoteForm.notes
                })
                : new URLSearchParams({
                    rfq_id: selectedRFQ?.id || '',
                    vendor_id: userId || '',
                    price: quoteForm.price,
                    delivery_time: quoteForm.deliveryTime,
                    notes: quoteForm.notes
                })

            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': isEditingQuote ? 'application/json' : 'application/x-www-form-urlencoded'
                },
                body: body
            })

            if (res.ok) {
                setShowQuoteForm(false)
                setIsEditingQuote(false)
                setQuoteForm({ price: "", deliveryTime: "", notes: "" })
                setSelectedRFQ(null)
                setSelectedQuote(null)
                fetchMyQuotes()
                fetchOpenRFQs()
                fetchStats()
            }
        } catch (error) {
            console.error('Failed to submit/update quote:', error)
        }
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 -mx-8 -mt-8 px-8 py-4">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold">Vendor Dashboard</h1>
                        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/vendor')} className="gap-2">
                            <LayoutDashboard className="h-4 w-4" />
                            Overview
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/vendor/orders')} className="gap-2">
                            <Package className="h-4 w-4" />
                            Orders
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/vendor/catalog')} className="gap-2">
                            <Package className="h-4 w-4" />
                            Catalog
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/profile')} className="gap-2">
                            <Package className="h-4 w-4" />
                            Profile
                        </Button>
                        <DashboardSwitcher />
                    </div>
                    <div className="flex items-center gap-4">
                        <NotificationBell />
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">
                            {typeof window !== 'undefined' && localStorage.getItem("userName") || "Vendor"}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                if (typeof window !== 'undefined') {
                                    localStorage.clear()
                                    window.location.href = "/login"
                                }
                            }}
                        >
                            Logout
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid md:grid-cols-4 lg:grid-cols-5 gap-6 mb-8">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-600">Open RFQs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.new_rfqs}</div>
                            <div className="text-xs text-zinc-500 mt-1">{stats.new_rfqs_change}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-600">My Quotes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.active_quotes}</div>
                            <div className="text-xs text-zinc-500 mt-1">{stats.active_quotes_expire}</div>
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
                            <div className="text-2xl font-bold">{products.length}</div>
                            <div className="text-xs text-zinc-500 mt-1">In your catalog</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Advanced Analytics Section */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
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
                                        {/* Simplified Pie Chart using SVG strokes */}
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

                {/* Sections */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Incoming RFQs */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Incoming RFQs
                            </CardTitle>
                            <CardDescription>Browse open quote requests</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                                {rfqs.map((rfq) => (
                                    <div key={rfq.id} className="p-4 border rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors group">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-medium">{rfq.title}</h4>
                                            <Badge variant="outline" className={rfq.status === 'Quoted' ? 'bg-indigo-50 text-indigo-600' : 'bg-green-50 text-green-600'}>
                                                {rfq.status}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3 line-clamp-2">
                                            Qty: {rfq.quantity} • {rfq.description}
                                        </p>
                                        <Button
                                            size="sm"
                                            onClick={() => {
                                                setSelectedRFQ(rfq)
                                                setIsEditingQuote(false)
                                                setShowQuoteForm(true)
                                            }}
                                            className="w-full sm:w-auto"
                                            variant={rfq.status === 'Quoted' ? 'outline' : 'default'}
                                        >
                                            {rfq.status === 'Quoted' ? 'Update Quote' : 'Submit Quote'}
                                        </Button>
                                    </div>
                                ))}
                                {rfqs.length === 0 && (
                                    <p className="text-center text-zinc-500 py-8 italic underline">No open RFQs available at the moment</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* My Quotes */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                My Quotations
                            </CardTitle>
                            <CardDescription>Track and manage your submitted proposals</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                                {quotes.map((quote) => (
                                    <div key={quote.id} className="p-4 border rounded-lg group hover:border-indigo-200 transition-all">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-lg">${quote.price} USD</h4>
                                                <p className="text-sm text-zinc-600">Delivery: {quote.delivery_time}</p>
                                                <p className="text-xs text-zinc-400 mt-1">Ref: {quote.rfq_id.split('-')[0]}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded-sm ${quote.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                                    quote.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {quote.status}
                                                </span>
                                                {quote.status === 'pending' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-7 text-xs gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => {
                                                            setSelectedQuote(quote)
                                                            setQuoteForm({
                                                                price: quote.price.toString(),
                                                                deliveryTime: quote.delivery_time,
                                                                notes: quote.notes || ""
                                                            })
                                                            setIsEditingQuote(true)
                                                            setShowQuoteForm(true)
                                                        }}
                                                    >
                                                        <Edit2 className="h-3 w-3" />
                                                        Edit
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {quotes.length === 0 && (
                                    <p className="text-center text-zinc-500 py-8 italic underline">No quotes submitted yet</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quote Form Modal */}
                {showQuoteForm && (selectedRFQ || isEditingQuote) && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all animate-in fade-in zoom-in duration-200">
                        <Card className="w-full max-w-2xl shadow-2xl">
                            <CardHeader className="border-b">
                                <CardTitle>{isEditingQuote ? 'Modify Your Quote' : `New Quote: ${selectedRFQ?.title || 'RFQ'}`}</CardTitle>
                                <CardDescription>Enter your best pricing and fastest delivery to win the bid</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Unit Price (USD)</Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                            <Input
                                                type="number"
                                                className="pl-9 text-lg font-bold"
                                                value={quoteForm.price}
                                                onChange={(e) => setQuoteForm({ ...quoteForm, price: e.target.value })}
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Delivery Lead Time</Label>
                                        <Input
                                            className="text-lg"
                                            value={quoteForm.deliveryTime}
                                            onChange={(e) => setQuoteForm({ ...quoteForm, deliveryTime: e.target.value })}
                                            placeholder="e.g., 5-7 Business Days"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Additional Terms & Notes</Label>
                                    <Textarea
                                        value={quoteForm.notes}
                                        onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                                        placeholder="Specify warranty, shipping terms, or regional availability..."
                                        rows={4}
                                        className="resize-none"
                                    />
                                </div>
                                <div className="flex gap-3 pt-4 justify-end border-t">
                                    <Button variant="ghost" onClick={() => {
                                        setShowQuoteForm(false)
                                        setIsEditingQuote(false)
                                        setSelectedRFQ(null)
                                        setSelectedQuote(null)
                                    }}>
                                        Back
                                    </Button>
                                    <Button onClick={handleSubmitQuote} className="bg-indigo-600 hover:bg-indigo-700 px-8 min-w-[140px] shadow-lg shadow-indigo-200">
                                        {isEditingQuote ? 'Save Changes' : 'Submit Proposal'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    )
}


