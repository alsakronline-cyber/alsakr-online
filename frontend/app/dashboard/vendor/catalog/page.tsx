"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Package, Plus, Trash2, Edit2, Search } from "lucide-react"

export default function VendorCatalogPage() {
    const [products, setProducts] = useState<any[]>([])
    const [showAddForm, setShowAddForm] = useState(false)
    const [formData, setFormData] = useState({
        part_number: "",
        manufacturer: "",
        description: "",
        price: "",
        currency: "USD"
    })

    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null

    useEffect(() => {
        if (userId) {
            fetchProducts()
        }
    }, [userId])

    const fetchProducts = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.app.alsakronline.com'}/api/catalog/products?vendor_id=${userId}`)
            const data = await res.json()
            setProducts(data.products || [])
        } catch (error) {
            console.error('Fetch products failed:', error)
        }
    }

    const handleAddProduct = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.app.alsakronline.com'}/api/catalog/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    vendor_id: userId
                })
            })
            if (res.ok) {
                setShowAddForm(false)
                setFormData({ part_number: "", manufacturer: "", description: "", price: "", currency: "USD" })
                fetchProducts()
            }
        } catch (error) {
            console.error('Add product failed:', error)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.app.alsakronline.com'}/api/catalog/products/${id}`, {
                method: 'DELETE'
            })
            fetchProducts()
        } catch (error) {
            console.error('Delete failed:', error)
        }
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Product Catalog</h1>
                        <p className="text-zinc-500">Manage your industrial parts inventory</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => window.history.back()}>Back</Button>
                        <Button onClick={() => setShowAddForm(true)} className="bg-indigo-600 hover:bg-indigo-700">
                            <Plus className="h-4 w-4 mr-2" /> Add Product
                        </Button>
                    </div>
                </div>

                {showAddForm && (
                    <Card className="mb-8 border-indigo-500/50 shadow-lg shadow-indigo-500/10">
                        <CardHeader>
                            <CardTitle>Add New Product</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Part Number</Label>
                                    <Input
                                        value={formData.part_number}
                                        onChange={(e) => setFormData({ ...formData, part_number: e.target.value })}
                                        placeholder="e.g. 1041002"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Manufacturer</Label>
                                    <Input
                                        value={formData.manufacturer}
                                        onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                                        placeholder="e.g. SICK AG"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Full product technical description..."
                                />
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Price ({formData.currency})</Label>
                                    <Input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                                <Button onClick={handleAddProduct} className="bg-indigo-600 hover:bg-indigo-700">Save Product</Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid md:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <Card key={product.id} className="group hover:border-indigo-500/50 transition-all">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <Badge variant="outline" className="text-indigo-600 font-mono">
                                        {product.part_number}
                                    </Badge>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id)} className="h-8 w-8 p-0 text-red-500 hover:text-red-600">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <CardTitle className="text-lg mt-2">{product.manufacturer}</CardTitle>
                                <CardDescription className="line-clamp-2">{product.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50 p-2 rounded-lg">
                                    <span className="text-sm text-zinc-500 font-medium">Standard Price</span>
                                    <span className="text-lg font-bold text-zinc-900 dark:text-white">
                                        ${product.price} <small className="text-[10px] text-zinc-500 ml-1">USD</small>
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {products.length === 0 && !showAddForm && (
                        <div className="col-span-full text-center py-20 bg-white dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                            <Package className="h-16 w-16 mx-auto mb-4 text-zinc-200" />
                            <h3 className="text-xl font-bold">Your Catalog is Empty</h3>
                            <p className="text-zinc-500 mb-6">Start adding your products to receive quote requests.</p>
                            <Button onClick={() => setShowAddForm(true)} className="bg-indigo-600 hover:bg-indigo-700">
                                <Plus className="h-4 w-4 mr-2" /> Add Your First Product
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
