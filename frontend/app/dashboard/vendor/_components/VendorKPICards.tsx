import { Inbox, FileText, TrendingUp } from "lucide-react"

interface VendorStats {
    new_rfqs: number
    active_quotes: number
    acceptance_rate: number
    new_rfqs_change: string
    active_quotes_expire: string
}

export default function VendorKPICards({ stats }: { stats: VendorStats | null }) {
    // Default values if no stats provided
    const data = stats || {
        new_rfqs: 0,
        active_quotes: 0,
        acceptance_rate: 0,
        new_rfqs_change: "--",
        active_quotes_expire: "--"
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl bg-gray-800 border border-white/5">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-primary">
                        <Inbox className="w-6 h-6" />
                    </div>
                    <span className="text-xs text-green-400 flex items-center">{data.new_rfqs_change}</span>
                </div>
                <h3 className="text-3xl font-bold mb-1">{data.new_rfqs}</h3>
                <p className="text-sm text-gray-400">New RFQs Awaiting</p>
            </div>

            <div className="p-6 rounded-xl bg-gray-800 border border-white/5">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-orange-500/10 rounded-lg text-secondary">
                        <FileText className="w-6 h-6" />
                    </div>
                    <span className="text-xs text-orange-400 flex items-center">{data.active_quotes_expire}</span>
                </div>
                <h3 className="text-3xl font-bold mb-1">{data.active_quotes}</h3>
                <p className="text-sm text-gray-400">Active Quotations</p>
            </div>

            <div className="p-6 rounded-xl bg-gray-800 border border-white/5">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded">High Perf</span>
                </div>
                <h3 className="text-3xl font-bold mb-1">{data.acceptance_rate}%</h3>
                <p className="text-sm text-gray-400">Acceptance Rate</p>
            </div>
        </div>
    )
}
