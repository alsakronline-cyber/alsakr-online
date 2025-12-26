"use client";

import { useEffect, useState } from "react";
import { useRFQ, RFQ } from "@/context/RFQContext";
import { format } from "date-fns";
import { LucideFileText, LucideLoader, LucideChevronRight } from "lucide-react";
import { RFQDetails } from "./RFQDetails";

export function RFQList() {
    const { rfqs, fetchRFQs, loading } = useRFQ();
    const [selectedRFQ, setSelectedRFQ] = useState<RFQ | null>(null);

    useEffect(() => {
        fetchRFQs("buyer");
    }, []);

    if (selectedRFQ) {
        return <RFQDetails rfq={selectedRFQ} onBack={() => setSelectedRFQ(null)} />;
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">My Quote Requests</h2>

            {loading && rfqs.length === 0 ? (
                <div className="flex justify-center p-8"><LucideLoader className="animate-spin" /></div>
            ) : rfqs.length === 0 ? (
                <div className="text-center p-8 border border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-500">You haven't submitted any RFQs yet.</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {rfqs.map((rfq) => (
                                <tr key={rfq.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedRFQ(rfq)}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {format(new Date(rfq.created_at), 'MMM dd, yyyy')}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                        {rfq.title}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${rfq.status === 'open' ? 'bg-green-100 text-green-800' :
                                                rfq.status === 'quoted' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-gray-100 text-gray-800'}`}>
                                            {rfq.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {rfq.quantity}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button className="text-primary hover:text-blue-900">
                                            <LucideChevronRight className="w-5 h-5" />
                                        </button>
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
