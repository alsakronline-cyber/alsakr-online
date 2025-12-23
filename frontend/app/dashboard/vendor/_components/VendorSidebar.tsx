import {
    LayoutDashboard,
    Inbox,
    FileText,
    ShoppingCart,
    Package
} from "lucide-react"

export default function VendorSidebar() {
    return (
        <aside className="w-64 border-r border-white/10 bg-gray-900 flex flex-col">
            <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                        N
                    </div>
                    <div>
                        <h2 className="font-bold text-lg leading-tight">Nexus Ind.</h2>
                        <span className="text-xs text-accent uppercase tracking-wider">Vendor Portal</span>
                    </div>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                <button className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-white bg-white/5 rounded-lg">
                    <LayoutDashboard className="w-5 h-5" />
                    Dashboard
                </button>
                <button className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-lg">
                    <Inbox className="w-5 h-5" />
                    <span className="flex-1 text-left">Incoming RFQs</span>
                    <span className="px-2 py-0.5 text-xs bg-primary text-white rounded-full">12</span>
                </button>
                <button className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-lg">
                    <FileText className="w-5 h-5" />
                    Quotations
                </button>
                <button className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-lg">
                    <ShoppingCart className="w-5 h-5" />
                    Orders
                </button>
                <button className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-lg">
                    <Package className="w-5 h-5" />
                    Catalog
                </button>
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
