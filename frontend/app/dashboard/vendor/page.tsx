import {
    LayoutDashboard,
    Inbox,
    FileText,
    ShoppingCart,
    Package,
    BarChart3,
    MessageSquare,
    Settings,
    TrendingUp,
    MoreHorizontal
} from "lucide-react"

export default function VendorDashboard() {
    return (
        <div className="flex h-screen bg-gray-900 text-white font-sans">
            {/* Sidebar */}
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

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-black/20">
                <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
                    <h1 className="text-xl font-bold">Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <button className="p-2 text-gray-400 hover:text-white relative">
                            <Inbox className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        <div className="w-px h-6 bg-white/10"></div>
                        <span className="text-sm text-gray-400">Dec 22, 2025</span>
                    </div>
                </header>

                <div className="p-8 space-y-8">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="p-6 rounded-xl bg-gray-800 border border-white/5">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-blue-500/10 rounded-lg text-primary">
                                    <Inbox className="w-6 h-6" />
                                </div>
                                <span className="text-xs text-green-400 flex items-center">+3 today</span>
                            </div>
                            <h3 className="text-3xl font-bold mb-1">12</h3>
                            <p className="text-sm text-gray-400">New RFQs Awaiting</p>
                        </div>

                        <div className="p-6 rounded-xl bg-gray-800 border border-white/5">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-orange-500/10 rounded-lg text-secondary">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <span className="text-xs text-orange-400 flex items-center">2 expiring</span>
                            </div>
                            <h3 className="text-3xl font-bold mb-1">8</h3>
                            <p className="text-sm text-gray-400">Active Quotations</p>
                        </div>

                        <div className="p-6 rounded-xl bg-gray-800 border border-white/5">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded">High Perf</span>
                            </div>
                            <h3 className="text-3xl font-bold mb-1">65%</h3>
                            <p className="text-sm text-gray-400">Acceptance Rate</p>
                        </div>
                    </div>

                    {/* Recent Inquiries Table */}
                    <div className="bg-gray-800 border border-white/5 rounded-xl overflow-hidden">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <h3 className="font-bold text-lg">Recent Inquiries</h3>
                            <button className="text-sm text-primary hover:text-blue-400">View All</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-white/5 text-gray-400 uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-4 rounded-tl-lg">RFQ ID</th>
                                        <th className="px-6 py-4">Part Details</th>
                                        <th className="px-6 py-4">Quantity</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 rounded-tr-lg">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    <tr className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-mono text-gray-300">#RFQ-2025-001</td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-white">SKF 6205-2RS</p>
                                            <p className="text-xs text-gray-500">Deep Groove Ball Bearing</p>
                                        </td>
                                        <td className="px-6 py-4">50 units</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-500/10 text-blue-400">New</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button className="text-sm text-secondary hover:text-orange-400">Quote Now</button>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-mono text-gray-300">#RFQ-2025-002</td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-white">Siemens 6ES7-123</p>
                                            <p className="text-xs text-gray-500">PLC S7-1200 CPU</p>
                                        </td>
                                        <td className="px-6 py-4">2 units</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-500/10 text-orange-400">Expiring</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button className="text-sm text-secondary hover:text-orange-400">Quote Now</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
