export function InquiryKanban() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-900/50 p-6 rounded-xl">
            {/* Pending Column */}
            <div className="space-y-4">
                <header className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-400">Pending</h3>
                    <span className="bg-gray-800 px-2 py-1 rounded text-xs text-white">4</span>
                </header>
                <div className="bg-gray-800 p-4 rounded-lg border border-white/5 cursor-pointer hover:border-primary/50 transition">
                    <div className="flex justify-between mb-2">
                        <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">Low</span>
                        <span className="text-xs text-gray-500">2h ago</span>
                    </div>
                    <p className="font-medium text-white mb-1">ABB Circuit Breaker</p>
                    <p className="text-xs text-gray-400">RFQ #28492</p>
                </div>
            </div>

            {/* Quoted Column */}
            <div className="space-y-4">
                <header className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-400">Quoted</h3>
                    <span className="bg-gray-800 px-2 py-1 rounded text-xs text-white">2</span>
                </header>
                <div className="bg-gray-800 p-4 rounded-lg border border-white/5 cursor-pointer hover:border-secondary/50 transition">
                    <div className="flex justify-between mb-2">
                        <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded">High</span>
                        <span className="text-xs text-gray-500">1d ago</span>
                    </div>
                    <p className="font-medium text-white mb-1">Siemens S7-1200</p>
                    <p className="text-xs text-gray-400">RFQ #28421</p>
                </div>
            </div>

            {/* Closed Column */}
            <div className="space-y-4">
                <header className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-400">Closed</h3>
                    <span className="bg-gray-800 px-2 py-1 rounded text-xs text-white">12</span>
                </header>
                {/* Empty for now */}
            </div>
        </div>
    )
}
