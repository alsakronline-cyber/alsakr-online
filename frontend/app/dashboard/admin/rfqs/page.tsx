"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Search, ExternalLink, Filter } from "lucide-react"

export default function AdminRFQsPage() {
    const [rfqs, setRfqs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        fetchRFQs()
    }, [])

    const fetchRFQs = async () => {
        try {
            // Reusing the general RFQ endpoint for now, or we could add an admin specific one
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.app.alsakronline.com'}/api/rfqs`)
            const data = await res.json()
            setRfqs(data || [])
        } catch (error) {
            console.error("Failed to fetch platform RFQs:", error)
        } finally {
            setLoading(false)
        }
    }

    const filteredRFQs = rfqs.filter(rfq =>
        rfq.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rfq.id?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) return <div className="p-8">Loading global inquiries...</div>

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <Button variant="ghost" onClick={() => window.history.back()} className="mb-4">
                        ← Back to Admin
                    </Button>
                    <h1 className="text-3xl font-bold">Inquiry Management</h1>
                    <p className="text-zinc-500">Monitor and manage all RFQs across the platform</p>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <CardTitle>Global RFQs</CardTitle>
                                <CardDescription>Comprehensive overview of platform-wide procurement activity</CardDescription>
                            </div>
                            <div className="relative w-full md:w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                <Input
                                    placeholder="Search by title or ID..."
                                    className="pl-10"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Inquiry</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Qty</TableHead>
                                    <TableHead>Target Price</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRFQs.map((rfq) => (
                                    <TableRow key={rfq.id}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium underline group cursor-pointer">
                                                    {rfq.title}
                                                </span>
                                                <span className="text-[10px] text-zinc-400 font-mono">{rfq.id}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={
                                                rfq.status === 'open' ? 'bg-green-50 text-green-600' :
                                                    rfq.status === 'quoted' ? 'bg-indigo-50 text-indigo-600' : 'bg-zinc-50 text-zinc-600'
                                            }>
                                                {rfq.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-mono">{rfq.quantity}</TableCell>
                                        <TableCell>{rfq.target_price ? `$${rfq.target_price}` : 'N/A'}</TableCell>
                                        <TableCell className="text-xs text-zinc-500">
                                            {new Date(rfq.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" className="gap-2">
                                                <ExternalLink className="h-3 w-3" />
                                                View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredRFQs.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12 text-zinc-500">
                                            No inquiries match your search or filters.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}


