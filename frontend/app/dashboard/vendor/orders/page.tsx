"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DollarSign, Package, Truck, CheckCircle, Clock } from "lucide-react"

export default function VendorOrdersPage() {
    const [orders, setOrders] = useState<any[]>([])
    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null

    useEffect(() => {
        if (userId) {
            fetchOrders()
        }
    }, [userId])

    const fetchOrders = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.app.alsakronline.com'}/api/orders?vendor_id=${userId}`)
            const data = await res.json()
            setOrders(data.orders || [])
        } catch (error) {
            console.error('Failed to fetch orders:', error)
        }
    }

    const updateStatus = async (orderId: string, status: string, tracking?: string) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.app.alsakronline.com'}/api/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, tracking_number: tracking })
            })
            if (res.ok) {
                fetchOrders()
                alert(`Order marked as ${status}`)
            }
        } catch (error) {
            console.error('Update failed:', error)
        }
    }

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-yellow-500/10 text-yellow-500',
            processing: 'bg-blue-500/10 text-blue-500',
            shipped: 'bg-indigo-500/10 text-indigo-500',
            delivered: 'bg-green-500/10 text-green-500',
            cancelled: 'bg-red-500/10 text-red-500'
        }
        return colors[status] || 'bg-gray-500/10 text-gray-500'
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Order Management</h1>
                        <p className="text-zinc-500">Track and fulfill your customer orders</p>
                    </div>
                    <Button variant="outline" onClick={() => window.history.back()}>Back to Dashboard</Button>
                </div>

                <div className="grid gap-6">
                    {orders.map((order) => (
                        <Card key={order.id} className="border-zinc-200 dark:border-zinc-800">
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                    <div className="space-y-4 flex-1">
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg font-bold font-mono">ORD-{order.id.slice(0, 8).toUpperCase()}</span>
                                            <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                                            <div>
                                                <Label className="text-xs text-zinc-500 uppercase">Amount</Label>
                                                <div className="text-lg font-bold flex items-center gap-1">
                                                    <DollarSign className="h-4 w-4" />
                                                    {order.total_amount}
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="text-xs text-zinc-500 uppercase">Date</Label>
                                                <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-medium">
                                                    <Clock className="h-4 w-4" />
                                                    {new Date(order.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="text-xs text-zinc-500 uppercase">Tracking</Label>
                                                <div className="text-indigo-600 font-mono text-sm underline cursor-pointer">
                                                    {order.tracking_number || "Awaiting Shipment"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 w-full md:w-48">
                                        {order.status === 'pending' && (
                                            <Button onClick={() => updateStatus(order.id, 'processing')} className="w-full bg-blue-600 hover:bg-blue-700">
                                                Process Order
                                            </Button>
                                        )}
                                        {order.status === 'processing' && (
                                            <Button onClick={() => {
                                                const tracking = prompt("Enter Tracking Number:")
                                                if (tracking) updateStatus(order.id, 'shipped', tracking)
                                            }} className="w-full bg-indigo-600 hover:bg-indigo-700">
                                                Mark as Shipped
                                            </Button>
                                        )}
                                        {order.status === 'shipped' && (
                                            <Button onClick={() => updateStatus(order.id, 'delivered')} className="w-full bg-green-600 hover:bg-green-700">
                                                Confirm Delivery
                                            </Button>
                                        )}
                                        <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-500/10">
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {orders.length === 0 && (
                        <div className="text-center py-20 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                            <Package className="h-16 w-16 mx-auto mb-4 text-zinc-300" />
                            <h3 className="text-xl font-bold">No orders yet</h3>
                            <p className="text-zinc-500">Orders will appear here when a buyer accepts your quote.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
