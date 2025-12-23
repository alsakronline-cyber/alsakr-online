import { Inbox } from "lucide-react"

export default function VendorHeader() {
    return (
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
    )
}
