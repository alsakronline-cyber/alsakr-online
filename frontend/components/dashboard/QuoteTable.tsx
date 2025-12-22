export function QuoteTable() {
    return (
        <div className="bg-gray-800 border border-white/5 rounded-xl overflow-hidden mt-6">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h3 className="font-bold text-lg text-white">Recent Quotes</h3>
                <button className="text-sm text-primary hover:text-blue-400">View All</button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="bg-white/5 uppercase text-xs text-gray-300">
                        <tr>
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Total</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        <tr className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 font-mono">#Q-1029</td>
                            <td className="px-6 py-4 font-medium text-white">Saudi Aramco</td>
                            <td className="px-6 py-4 text-green-400">$2,450.00</td>
                            <td className="px-6 py-4"><span className="px-2 py-1 rounded-full bg-green-500/10 text-green-400 text-xs">Accepted</span></td>
                            <td className="px-6 py-4">Dec 20, 2025</td>
                        </tr>
                        <tr className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 font-mono">#Q-1030</td>
                            <td className="px-6 py-4 font-medium text-white">Emaar Industries</td>
                            <td className="px-6 py-4 text-white">$1,200.00</td>
                            <td className="px-6 py-4"><span className="px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-xs">Pending</span></td>
                            <td className="px-6 py-4">Dec 21, 2025</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}
