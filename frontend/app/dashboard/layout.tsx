"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import CartCount from "@/components/ui/CartCount"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [userRole, setUserRole] = useState<string | null>(null)

    useEffect(() => {
        const role = localStorage.getItem("userRole")
        setUserRole(role)
    }, [])

    const showBuyer = userRole === "buyer" || userRole === "both"
    const showVendor = userRole === "vendor" || userRole === "both"
    const showAdmin = userRole === "admin"

    return (
        <div className="flex min-h-screen">
            <aside className="w-64 bg-gray-900 text-white p-6">
                <h2 className="text-xl font-bold mb-8">Alsakr Online</h2>
                <nav className="space-y-4">
                    {showBuyer && (
                        <Link href="/dashboard/buyer" className="block hover:text-blue-400">
                            Buyer Dashboard
                        </Link>
                    )}
                    {showVendor && (
                        <Link href="/dashboard/vendor" className="block hover:text-blue-400">
                            Vendor Portal
                        </Link>
                    )}
                    {showAdmin && (
                        <Link href="/dashboard/admin" className="block hover:text-blue-400">
                            Admin Panel
                        </Link>
                    )}
                    <div className="border-t border-gray-700 pt-4 mt-4">
                        <Link href="/cart" className="flex items-center justify-between hover:text-blue-400">
                            <span>Shopping Cart</span>
                            <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                                <CartCount />
                            </span>
                        </Link>
                    </div>
                </nav>
            </aside>
            <main className="flex-1 bg-gray-50">
                {children}
            </main>
        </div>
    )
}
