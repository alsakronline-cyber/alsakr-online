"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
    const router = useRouter()

    useEffect(() => {
        // Get user role from localStorage
        const userRole = localStorage.getItem("userRole")

        if (!userRole) {
            // No role found, redirect to login
            router.push("/login")
            return
        }

        // Redirect based on role
        if (userRole === "buyer" || userRole === "both") {
            router.push("/dashboard/buyer")
        } else if (userRole === "vendor") {
            router.push("/dashboard/vendor")
        } else {
            // Invalid role, logout
            localStorage.clear()
            router.push("/login")
        }
    }, [router])

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
            <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-600" />
                <p className="mt-4 text-zinc-600 dark:text-zinc-400">Loading dashboard...</p>
            </div>
        </div>
    )
}
