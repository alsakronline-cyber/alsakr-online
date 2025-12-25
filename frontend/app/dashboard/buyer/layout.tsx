"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { FileText, Package, ShoppingCart, Clock, Plus, Send, CheckCircle, XCircle, LayoutDashboard, User, Edit2, ChevronRight, Eye } from "lucide-react"
import { NotificationBell } from "@/components/NotificationBell"
import { DashboardSwitcher } from "@/components/DashboardSwitcher"

export default function BuyerDashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const [rfqs, setRfqs] = useState<any[]>([])
    const [quotes, setQuotes] = useState<any[]>([])
    const [notifications, setNotifications] = useState<any[]>([])
    const [showRFQForm, setShowRFQForm] = useState(false)
    const [rfqForm, setRfqForm] = useState({
        title: "",
        description: "",
        partDescription: "",
        quantity: 1,
        targetPrice: "",
        requirements: ""
    })
    const [selectedRFQ, setSelectedRFQ] = useState<any>(null)
    const [selectedQuote, setSelectedQuote] = useState<any>(null)
    const [isEditingRFQ, setIsEditingRFQ] = useState(false)
    const [editForm, setEditForm] = useState<any>(null)

    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null

    useEffect(() => {
        if (userId) {
            fetchRFQs()
            fetchQuotes()
            fetchNotifications() // Added fetchNotifications call
        }
    }, [userId])

    const fetchRFQs = async () => {
        try {
            const token = localStorage.getItem('token')
            if (!token) return

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.app.alsakronline.com'}/api/rfqs?buyer_id=${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const data = await res.json()
            setRfqs(data.rfqs || [])
        } catch (error) {
            console.error('Failed to fetch RFQs:', error)
        }
    }

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token')
            if (!token) return

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.app.alsakronline.com'}/api/notifications?user_id=${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const data = await res.json()
            setNotifications(data.notifications || [])
        } catch (error) {
            console.error('Failed to fetch notifications:', error)
        }
    }

    const fetchQuotes = async () => {
        try {
            const token = localStorage.getItem('token')
            if (!token) return

            // Fetch quotes for all RFQs
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.app.alsakronline.com'}/api/quotes`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const data = await res.json()
            setQuotes(data.quotes || [])
        } catch (error) {
            console.error('Failed to fetch quotes:', error)
        }
    }

    const handleUpdateRFQ = async (e: React.FormEvent) => {
        e.preventDefault()
        const token = localStorage.getItem('token')
        if (!token) return

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.app.alsakronline.com'}/api/rfqs/${editForm.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editForm)
            })

            if (res.ok) {
                setIsEditingRFQ(false)
                setSelectedRFQ(null)
                fetchRFQs()
            }
        } catch (error) {
            console.error('Failed to update RFQ:', error)
        }
    }

    const handleCreateRFQ = async () => {
        const token = localStorage.getItem('token')
        if (!token) return

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.app.alsakronline.com'}/api/rfqs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Bearer ${token}`
                },
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

    const handleQuoteAction = async (quoteId: string, status: 'accepted' | 'rejected') => {
        const token = localStorage.getItem('token')
        if (!token) return

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.app.alsakronline.com'}/api/quotes/${quoteId}?status=${status}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (res.ok) {
                alert(`✅ Quote ${status} successfully!`)
                fetchQuotes()
                fetchRFQs()
            } else {
                const error = await res.json()
                alert(`❌ Failed to ${status} quote: ${error.detail || 'Unknown error'}`)
            }
        } catch (error) {
            console.error(`Failed to ${status} quote:`, error)
            alert(`❌ Error connecting to server to ${status} quote.`)
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
                        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/buyer')} className="gap-2">
                            <LayoutDashboard className="h-4 w-4" />
                            Overview
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/buyer/orders')} className="gap-2">
                            <ShoppingCart className="h-4 w-4" />
                            Orders
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/buyer')}>
                            Search Parts
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/profile')} className="gap-2">
                            <User className="h-4 w-4" />
                            Profile
                        </Button>
                        <DashboardSwitcher />
                    </div>
                    <div className="flex items-center gap-4">
                        <NotificationBell />
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
                                    <div key={rfq.id} className="p-3 border rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 group relative">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-medium">{rfq.title}</h4>
                                                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                                    Qty: {rfq.quantity}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => {
                                                        setSelectedRFQ(rfq)
                                                        setEditForm({
                                                            title: rfq.title,
                                                            description: rfq.description,
                                                            partDescription: rfq.part_description,
                                                            quantity: rfq.quantity,
                                                            targetPrice: rfq.target_price,
                                                            requirements: rfq.requirements
                                                        })
                                                        setIsEditingRFQ(true)
                                                    }}
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(rfq.status)}`}>
                                                    {rfq.status}
                                                </span>
                                            </div>
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
                                    <div key={quote.id} className="p-3 border rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 group">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-medium">${quote.price} {quote.currency}</h4>
                                                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                                    Delivery: {quote.delivery_time}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="gap-1 px-2"
                                                    onClick={() => setSelectedQuote(quote)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    View
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/20"
                                                    onClick={() => handleQuoteAction(quote.id, 'accepted')}
                                                >
                                                    <CheckCircle className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                                                    onClick={() => handleQuoteAction(quote.id, 'rejected')}
                                                >
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
                {/* RFQ Editing Side Panel */}
                {isEditingRFQ && selectedRFQ && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end">
                        <div className="w-full md:w-[500px] bg-white dark:bg-zinc-900 h-full p-6 shadow-xl animate-in slide-in-from-right overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold">Edit RFQ: {selectedRFQ.title}</h2>
                                <Button variant="ghost" size="icon" onClick={() => setIsEditingRFQ(false)}><XCircle className="h-5 w-5" /></Button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label>Title</Label>
                                    <Input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Quantity</Label>
                                        <Input type="number" value={editForm.quantity} onChange={(e) => setEditForm({ ...editForm, quantity: parseInt(e.target.value) })} />
                                    </div>
                                    <div>
                                        <Label>Target Price</Label>
                                        <Input value={editForm.targetPrice} onChange={(e) => setEditForm({ ...editForm, targetPrice: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <Label>Part Description</Label>
                                    <Input value={editForm.partDescription} onChange={(e) => setEditForm({ ...editForm, partDescription: e.target.value })} />
                                </div>
                                <div>
                                    <Label>Detailed Description</Label>
                                    <Textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={4} />
                                </div>
                                <div>
                                    <Label>Special Requirements</Label>
                                    <Textarea value={editForm.requirements} onChange={(e) => setEditForm({ ...editForm, requirements: e.target.value })} rows={3} />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button onClick={handleUpdateRFQ} className="flex-1 bg-indigo-600 hover:bg-indigo-700">Save Changes</Button>
                                    <Button variant="outline" onClick={() => setIsEditingRFQ(false)} className="flex-1">Cancel</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quote Details Side Panel */}
                {selectedQuote && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end">
                        <div className="w-full md:w-[500px] bg-white dark:bg-zinc-900 h-full p-6 shadow-xl animate-in slide-in-from-right overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold">Quote Details</h2>
                                <Button variant="ghost" size="icon" onClick={() => setSelectedQuote(null)}><XCircle className="h-5 w-5" /></Button>
                            </div>

                            <div className="space-y-6">
                                <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                                    <div className="text-3xl font-bold text-indigo-600 mb-1">${selectedQuote.price} {selectedQuote.currency}</div>
                                    <div className="text-sm text-zinc-500">Delivery in {selectedQuote.delivery_time}</div>
                                </div>

                                <div>
                                    <Label className="text-zinc-500 uppercase text-xs">Vendor Notes</Label>
                                    <div className="p-3 border rounded-lg mt-1 min-h-[100px] bg-zinc-50 dark:bg-zinc-950/50">
                                        {selectedQuote.notes || "No additional notes provided."}
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-6 border-t">
                                    <Button
                                        className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
                                        onClick={() => {
                                            handleQuoteAction(selectedQuote.id, 'accepted')
                                            setSelectedQuote(null)
                                        }}
                                    >
                                        <CheckCircle className="h-4 w-4" />
                                        Accept Quote
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1 text-red-600 hover:text-red-700 gap-2"
                                        onClick={() => {
                                            handleQuoteAction(selectedQuote.id, 'rejected')
                                            setSelectedQuote(null)
                                        }}
                                    >
                                        <XCircle className="h-4 w-4" />
                                        Decline
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content Area */}
                {children}
            </main>
        </div>
    )
}
