"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { FileText, Package, ShoppingCart, Clock, Plus, Send, CheckCircle, XCircle } from "lucide-react"

export default function BuyerDashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const [rfqs, setRfqs] = useState<any[]>([])
    const [quotes, setQuotes] = useState<any[]>([])
    const [showRFQForm, setShowRFQForm] = useState(false)
    const [rfqForm, setRfqForm] = useState({
        title: "",
        description: "",
        partDescription: "",
        quantity: 1,
        targetPrice: "",
        requirements: ""
    })

    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null

    useEffect(() => {
        if (userId) {
            fetchRFQs()
            fetchQuotes()
        }
    }, [userId])

    const fetchRFQs = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.app.alsakronline.com'}/api/rfqs?buyer_id=${userId}`)
            const data = await res.json()
            setRfqs(data.rfqs || [])
        } catch (error) {
            console.error('Failed to fetch RFQs:', error)
        }
    }

    const fetchQuotes = async () => {
        try {
            // Fetch quotes for all RFQs
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.app.alsakronline.com'}/api/quotes`)
            const data = await res.json()
            setQuotes(data.quotes || [])
        } catch (error) {
            console.error('Failed to fetch quotes:', error)
        }
    }

    const handleCreateRFQ = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.app.alsakronline.com'}/api/rfqs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    title: rfqForm.title,
                    description: rfqForm.description,
                    part_description: rfqForm.partDescription,
                    quantity: rfqForm.quantity.toString(),
                    buyer_id: userId || '',
                    target_price: rfqForm.targetPrice,
                    requirements: rfqForm.requirements
                })
            })

            if (res.ok) {
                setShowRFQForm(false)
                setRfqForm({ title: "", description: "", partDescription: "", quantity: 1, targetPrice: "", requirements: "" })
                fetchRFQs()
            }
        } catch (error) {
            console.error('Failed to create RFQ:', error)
        }
    }

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            open: 'text-blue-500 bg-blue-500/10',
            quoted: 'text-yellow-500 bg-yellow-500/10',
            closed: 'text-green-500 bg-green-500/10',
            cancelled: 'text-red-500 bg-red-500/10'
        }
        return colors[status] || 'text-gray-500 bg-gray-500/10'
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            {/* Header */}
            <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Buyer Dashboard</h1>
                        <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/buyer')}>
                            Search Parts
                        </Button>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">
                            {typeof window !== 'undefined' && localStorage.getItem("userName") || "User"}
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
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {/* RFQs Section */}
                    <Card className="border-zinc-200 dark:border-zinc-800">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        My RFQs
                                    </CardTitle>
                                    <CardDescription>Track your quote requests</CardDescription>
                                </div>
                                <Button size="sm" onClick={() => setShowRFQForm(!showRFQForm)}>
                                    <Plus className="h-4 w-4 mr-1" /> New RFQ
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                {rfqs.map((rfq) => (
                                    <div key={rfq.id} className="p-3 border rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-medium">{rfq.title}</h4>
                                                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                                    Qty: {rfq.quantity}
                                                </p>
                                            </div>
                                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(rfq.status)}`}>
                                                {rfq.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {rfqs.length === 0 && (
                                    <p className="text-center text-zinc-500 py-8">No RFQs yet. Create one to get started!</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quotes Section */}
                    <Card className="border-zinc-200 dark:border-zinc-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Received Quotes
                            </CardTitle>
                            <CardDescription>Review vendor responses</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                {quotes.map((quote) => (
                                    <div key={quote.id} className="p-3 border rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-medium">${quote.price} {quote.currency}</h4>
                                                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                                    Delivery: {quote.delivery_time}
                                                </p>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button size="sm" variant="outline" className="text-green-600">
                                                    <CheckCircle className="h-4 w-4" />
                                                </Button>
                                                <Button size="sm" variant="outline" className="text-red-600">
                                                    <XCircle className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {quotes.length === 0 && (
                                    <p className="text-center text-zinc-500 py-8">No quotes received yet.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* RFQ Creation Form Modal */}
                {showRFQForm && (
                    <Card className="border-zinc-200 dark:border-zinc-800 mb-8">
                        <CardHeader>
                            <CardTitle>Create New RFQ</CardTitle>
                            <CardDescription>Submit a request for quotation</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Title</Label>
                                <Input
                                    value={rfqForm.title}
                                    onChange={(e) => setRfqForm({ ...rfqForm, title: e.target.value })}
                                    placeholder="e.g., Industrial Bearing Required"
                                />
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Part Description</Label>
                                    <Input
                                        value={rfqForm.partDescription}
                                        onChange={(e) => setRfqForm({ ...rfqForm, partDescription: e.target.value })}
                                        placeholder="Describe the part needed"
                                    />
                                </div>
                                <div>
                                    <Label>Quantity</Label>
                                    <Input
                                        type="number"
                                        value={rfqForm.quantity}
                                        onChange={(e) => setRfqForm({ ...rfqForm, quantity: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>Target Price (Optional)</Label>
                                <Input
                                    type="number"
                                    value={rfqForm.targetPrice}
                                    onChange={(e) => setRfqForm({ ...rfqForm, targetPrice: e.target.value })}
                                    placeholder="Your budget per unit"
                                />
                            </div>
                            <div>
                                <Label>Description</Label>
                                <Textarea
                                    value={rfqForm.description}
                                    onChange={(e) => setRfqForm({ ...rfqForm, description: e.target.value })}
                                    placeholder="Detailed description"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <Label>Special Requirements</Label>
                                <Textarea
                                    value={rfqForm.requirements}
                                    onChange={(e) => setRfqForm({ ...rfqForm, requirements: e.target.value })}
                                    placeholder="Certifications, delivery timeline, etc."
                                    rows={2}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={handleCreateRFQ} className="bg-indigo-600 hover:bg-indigo-700">
                                    <Send className="h-4 w-4 mr-2" />
                                    Submit RFQ
                                </Button>
                                <Button variant="outline" onClick={() => setShowRFQForm(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Main Content Area */}
                {children}
            </main>
        </div>
    )
}
