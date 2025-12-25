"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { User, Shield, CheckCircle, XCircle, Search, Edit2 } from "lucide-react"

export default function UserManagementPage() {
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        const userRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;
        if (userRole !== "admin") {
            router.push("/dashboard");
            return;
        }
        fetchUsers()
    }, [router])

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.app.alsakronline.com'}/api/admin/users`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            })
            const data = await res.json()
            setUsers(data)
        } catch (error) {
            console.error("Failed to fetch users:", error)
        } finally {
            setLoading(false)
        }
    }

    const toggleUserStatus = async (user: any) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.app.alsakronline.com'}/api/admin/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify({ is_active: !user.is_active })
            })
            if (res.ok) fetchUsers()
        } catch (error) {
            console.error("Failed to toggle user status:", error)
        }
    }

    const updateUserRole = async (user: any, newRole: string) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.app.alsakronline.com'}/api/admin/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify({ role: newRole })
            })
            if (res.ok) fetchUsers()
        } catch (error) {
            console.error("Failed to update user role:", error)
        }
    }

    const filteredUsers = users.filter(user =>
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) return <div className="p-8">Loading users...</div>

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <Button variant="ghost" onClick={() => window.history.back()} className="mb-4">
                        ← Back to Admin
                    </Button>
                    <h1 className="text-3xl font-bold">User Management</h1>
                    <p className="text-zinc-500">Manage platform users, roles, and access controls</p>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <CardTitle>Marketplace Users</CardTitle>
                                <CardDescription>A list of all registered buyers and vendors</CardDescription>
                            </div>
                            <div className="relative w-full md:w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                <Input
                                    placeholder="Search name, email, company..."
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
                                    <TableHead>User</TableHead>
                                    <TableHead>Company</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{user.full_name}</span>
                                                <span className="text-xs text-zinc-500">{user.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{user.company_name || 'N/A'}</TableCell>
                                        <TableCell>
                                            <select
                                                className="text-xs bg-zinc-100 dark:bg-zinc-800 p-1 rounded"
                                                value={user.role}
                                                onChange={(e) => updateUserRole(user, e.target.value)}
                                            >
                                                <option value="buyer">Buyer</option>
                                                <option value="vendor">Vendor</option>
                                                <option value="both">Both</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </TableCell>
                                        <TableCell>
                                            {user.is_active ? (
                                                <Badge variant="outline" className="text-green-600 bg-green-50">Active</Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-red-600 bg-red-50">Inactive</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => toggleUserStatus(user)}
                                                className={user.is_active ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}
                                            >
                                                {user.is_active ? "Deactivate" : "Activate"}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}


