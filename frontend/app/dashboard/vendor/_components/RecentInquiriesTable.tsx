interface Inquiry {
    id: string
    rfq_id: string
    part_name: string
    part_description: string
    quantity: number
    status: string
}

export default function RecentInquiriesTable({ inquiries }: { inquiries: Inquiry[] }) {

    return (
        <div className="bg-gray-800 border border-white/5 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h3 className="font-bold text-lg">Recent Inquiries</h3>
                <button className="text-sm text-primary hover:text-blue-400">View All</button>
            </div>
            <div className="overflow-x-auto">
                {inquiries.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">No inquiries found.</div>
                ) : (
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
                            {inquiries.map((inq) => (
                                <tr key={inq.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-mono text-gray-300">{inq.rfq_id}</td>
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-white">{inq.part_name}</p>
                                        <p className="text-xs text-gray-500 truncate max-w-xs">{inq.part_description}</p>
                                    </td>
                                    <td className="px-6 py-4">{inq.quantity} units</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${inq.status === 'New'
                                                ? 'bg-blue-500/10 text-blue-400'
                                                : 'bg-green-500/10 text-green-400'
                                            }`}>
                                            {inq.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="text-sm text-secondary hover:text-orange-400">
                                            {inq.status === 'New' ? 'Quote Now' : 'View Quote'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
