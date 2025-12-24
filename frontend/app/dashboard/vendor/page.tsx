"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileText, DollarSign, Package, TrendingUp, LayoutDashboard } from "lucide-react"
import { NotificationBell } from "@/components/NotificationBell"
import { DashboardSwitcher } from "@/components/DashboardSwitcher"

export default function EnhancedVendorPage() {
    const router = useRouter()
    const [rfqs, setRfqs] = useState<any[]>([])
    const [quotes, setQuotes] = useState<any[]>([])
    const [products, setProducts] = useState<any[]>([])
    const [showQuoteForm, setShowQuoteForm] = useState(false)
    const [selectedRFQ, setSelectedRFQ] = useState<any>(null)
    const [stats, setStats] = useState({
        new_rfqs: 0,
        active_quotes: 0,
        acceptance_rate: 0,
        total_revenue: 0,
        currency: "USD"
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
        if (!selectedRFQ) return

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.app.alsakronline.com'}/api/quotes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    rfq_id: selectedRFQ.id,
                    vendor_id: userId || '',
                    price: quoteForm.price,
                    delivery_time: quoteForm.deliveryTime,
                    notes: quoteForm.notes
                })
            })

            if (res.ok) {
                setShowQuoteForm(false)
                setQuoteForm({ price: "", deliveryTime: "", notes: "" })
                setSelectedRFQ(null)
                fetchMyQuotes()
                fetchOpenRFQs()
            }
        } catch (error) {
            console.error('Failed to submit quote:', error)
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
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-600">My Quotes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.active_quotes}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-600">Win Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.acceptance_rate}%</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-50/50 dark:bg-green-900/10">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-green-600">Total Revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                                ${stats.total_revenue.toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-600">Products</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{products.length}</div>
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
                            <div className="space-y-3 max-h-[500px] overflow-y-auto">
                                {rfqs.map((rfq) => (
                                    <div key={rfq.id} className="p-4 border rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900">
                                        <h4 className="font-medium mb-2">{rfq.title}</h4>
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                                            Qty: {rfq.quantity} {rfq.target_price && `• Target: $${rfq.target_price}`}
                                        </p>
                                        <Button
                                            size="sm"
                                            onClick={() => {
                                                setSelectedRFQ(rfq)
                                                setShowQuoteForm(true)
                                            }}
                                        >
                                            Submit Quote
                                        </Button>
                                    </div>
                                ))}
                                {rfqs.length === 0 && (
                                    <p className="text-center text-zinc-500 py-8">No open RFQs available</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* My Quotes */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                My Quotes
                            </CardTitle>
                            <CardDescription>Track submitted quotes</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 max-h-[500px] overflow-y-auto">
                                {quotes.map((quote) => (
                                    <div key={quote.id} className="p-4 border rounded-lg">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-medium">${quote.price} USD</h4>
                                                <p className="text-sm text-zinc-600">Delivery: {quote.delivery_time}</p>
                                            </div>
                                            <span className={`text-xs px-2 py-1 rounded-full ${quote.status === 'accepted' ? 'bg-green-500/10 text-green-500' :
                                                quote.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                                                    'bg-yellow-500/10 text-yellow-500'
                                                }`}>
                                                {quote.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {quotes.length === 0 && (
                                    <p className="text-center text-zinc-500 py-8">No quotes submitted yet</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quote Form Modal */}
                {showQuoteForm && selectedRFQ && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <Card className="w-full max-w-2xl">
                            <CardHeader>
                                <CardTitle>Submit Quote for: {selectedRFQ.title}</CardTitle>
                                <CardDescription>Provide your pricing and delivery terms</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Price (USD)</Label>
                                        <Input
                                            type="number"
                                            value={quoteForm.price}
                                            onChange={(e) => setQuoteForm({ ...quoteForm, price: e.target.value })}
                                            placeholder="Enter your price"
                                        />
                                    </div>
                                    <div>
                                        <Label>Delivery Time</Label>
                                        <Input
                                            value={quoteForm.deliveryTime}
                                            onChange={(e) => setQuoteForm({ ...quoteForm, deliveryTime: e.target.value })}
                                            placeholder="e.g., 2 weeks"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label>Notes (Optional)</Label>
                                    <Textarea
                                        value={quoteForm.notes}
                                        onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                                        placeholder="Additional information..."
                                        rows={3}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={handleSubmitQuote} className="bg-indigo-600 hover:bg-indigo-700">
                                        Submit Quote
                                    </Button>
                                    <Button variant="outline" onClick={() => {
                                        setShowQuoteForm(false)
                                        setSelectedRFQ(null)
                                    }}>
                                        Cancel
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
