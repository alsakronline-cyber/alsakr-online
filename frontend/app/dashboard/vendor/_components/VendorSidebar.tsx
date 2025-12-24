"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Inbox,
    FileText,
    ShoppingCart,
    Package
} from "lucide-react"

export default function VendorSidebar() {
    const pathname = usePathname()

    const navItems = [
        { name: "Dashboard", href: "/dashboard/vendor", icon: LayoutDashboard },
        { name: "Incoming RFQs", href: "/dashboard/vendor/rfqs", icon: Inbox, count: 12 },
        { name: "Quotations", href: "/dashboard/vendor/quotes", icon: FileText },
        { name: "Orders", href: "/dashboard/vendor/orders", icon: ShoppingCart },
        { name: "Catalog", href: "/dashboard/vendor/catalog", icon: Package },
    ]

    return (
        <aside className="w-64 border-r border-white/10 bg-gray-900 flex flex-col">
            <div className="p-6 border-b border-white/10">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                        N
                    </div>
                    <div>
                        <h2 className="font-bold text-lg leading-tight">Nexus Ind.</h2>
                        <span className="text-xs text-accent uppercase tracking-wider">Vendor Portal</span>
                    </div>
                </Link>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                                isActive
                                    ? "text-white bg-white/10"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="flex-1 text-left">{item.name}</span>
                            {item.count && (
                                <span className="px-2 py-0.5 text-xs bg-primary text-white rounded-full">
                                    {item.count}
                                </span>
                            )}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-white/10">
                <div className="flex items-center gap-3 px-4 py-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-secondary to-orange-600 flex items-center justify-center font-bold">
                        VS
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium">Vendor Solutions</p>
                        <p className="text-xs text-green-400">9.2/10 Rating</p>
                    </div>
                </div>
            </div>
        </aside>
    )
}
