"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileText, DollarSign, Package, TrendingUp } from "lucide-react"

export default function EnhancedVendorPage() {
    const [rfqs, setRfqs] = useState<any[]>([])
    const [quotes, setQuotes] = useState<any[]>([])
    const [products, setProducts] = useState<any[]>([])
    const [showQuoteForm, setShowQuoteForm] = useState(false)
    const [selectedRFQ, setSelectedRFQ] = useState<any>(null)
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
        }
    }, [userId])

    const fetchOpenRFQs = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.app.alsakronline.com'}/api/rfqs?status=open`)
            const data = await res.json()
            setRfqs(data.rfqs || [])
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
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
                    <Button
                        variant="outline"
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

                {/* Stats Cards */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-600">Open RFQs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{rfqs.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-600">My Quotes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{quotes.length}</div>
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
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-600">Win Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {quotes.length > 0 ? Math.round((quotes.filter(q => q.status === 'accepted').length / quotes.length) * 100) : 0}%
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
