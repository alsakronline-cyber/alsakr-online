"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Package, Clock, ExternalLink } from "lucide-react"

export default function BuyerOrdersPage() {
    const [orders, setOrders] = useState<any[]>([])
    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null

    useEffect(() => {
        if (userId) {
            fetchOrders()
        }
    }, [userId])

    const fetchOrders = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.app.alsakronline.com'}/api/orders?buyer_id=${userId}`)
            const data = await res.json()
            setOrders(data.orders || [])
        } catch (error) {
            console.error('Failed to fetch orders:', error)
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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">My Orders</h1>
                <Badge variant="outline" className="gap-1">
                    <ShoppingCart className="h-3 w-3" />
                    {orders.length} Orders
                </Badge>
            </div>

            <Card className="border-zinc-200 dark:border-zinc-800">
                <CardHeader>
                    <CardTitle>Order History</CardTitle>
                    <CardDescription>Track your purchases and shipping status</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order.id} className="p-4 border rounded-lg hover:border-indigo-500/50 transition-colors bg-white/50 dark:bg-zinc-900/50">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-sm font-bold">#{order.id.slice(0, 8).toUpperCase()}</span>
                                            <Badge className={getStatusColor(order.status)}>
                                                {order.status}
                                            </Badge>
                                        </div>
                                        <div className="text-sm text-zinc-500 flex items-center gap-2">
                                            <Clock className="h-3 w-3" />
                                            {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold">${order.total_amount} USD</div>
                                        {order.tracking_number && (
                                            <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                                                Tracking: {order.tracking_number}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Badge variant="outline" className="cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                        View Details <ExternalLink className="h-3 w-3 ml-1" />
                                    </Badge>
                                </div>
                            </div>
                        ))}
                        {orders.length === 0 && (
                            <div className="text-center py-12 text-zinc-500">
                                <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                <p>No orders found yet</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
