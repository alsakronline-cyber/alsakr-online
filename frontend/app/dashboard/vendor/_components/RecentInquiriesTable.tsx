export default function RecentInquiriesTable() {
    return (
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
    )
}
