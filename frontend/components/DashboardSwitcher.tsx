"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { RefreshCw, User, ShieldCheck } from "lucide-react"

export function DashboardSwitcher() {
    const router = useRouter()
    const pathname = usePathname()
    const [userRole, setUserRole] = useState<string | null>(null)

    useEffect(() => {
        const role = localStorage.getItem("userRole")
        setUserRole(role)
    }, [])

    if (userRole !== "both") return null

    const isBuyer = pathname.includes("/dashboard/buyer")
    const target = isBuyer ? "/dashboard/vendor" : "/dashboard/buyer"
    const label = isBuyer ? "Switch to Vendor" : "Switch to Buyer"

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(target)}
            className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20"
        >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline font-medium">{label}</span>
        </Button>
    )
}
