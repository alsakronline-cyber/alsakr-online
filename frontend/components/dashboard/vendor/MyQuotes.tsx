"use client";

import { useEffect } from "react";
import { useRFQ } from "@/context/RFQContext";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import { LucideLoader } from "lucide-react";

export function MyQuotes() {
    const { token } = useAuth();
    const { quotes, fetchQuotes, loading } = useRFQ();

    useEffect(() => {
        if (token) {
            // Fetch all quotes by this vendor
            fetchQuotes();
        }
    }, [token]);

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">My Submitted Quotes</h2>

            {loading && quotes.length === 0 ? (
                <div className="flex justify-center p-8"><LucideLoader className="animate-spin" /></div>
            ) : quotes.length === 0 ? (
                <div className="text-center p-8 border border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-500">You haven't submitted any quotes yet.</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RFQ ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {quotes.map((quote) => (
                                <tr key={quote.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {format(new Date(quote.created_at), 'MMM dd, yyyy')}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900 font-mono">
                                        {quote.rfq_id.substring(0, 8)}...
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                        {quote.price} {quote.currency}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${quote.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                                quote.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'}`}>
                                            {quote.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
