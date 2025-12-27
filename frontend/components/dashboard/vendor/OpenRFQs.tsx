"use client";

import { useEffect, useState } from "react";
import { useRFQ, RFQ } from "@/context/RFQContext";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import { LucideChevronRight, LucideLoader } from "lucide-react";
import { QuoteForm } from "./QuoteForm";

export function OpenRFQs() {
    const { token } = useAuth();
    const { rfqs, fetchRFQs, loading } = useRFQ();
    const [selectedRFQ, setSelectedRFQ] = useState<RFQ | null>(null);

    useEffect(() => {
        if (token) {
            // Vendors see open RFQs
            fetchRFQs("vendor");
        }
    }, [token]);

    if (selectedRFQ) {
        return <QuoteForm rfq={selectedRFQ} onBack={() => setSelectedRFQ(null)} />;
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">Marketplace: Open Requests</h2>

            {loading && rfqs.length === 0 ? (
                <div className="flex justify-center p-8"><LucideLoader className="animate-spin" /></div>
            ) : rfqs.length === 0 ? (
                <div className="text-center p-8 border border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-500">No open RFQs found at the moment.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {rfqs.map((rfq) => (
                        <div key={rfq.id} className="bg-white rounded-xl shadow p-6 hover:shadow-md transition-shadow border border-gray-200">
                            <div className="flex justify-between items-start mb-4">
                                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                                    {rfq.quantity} Units
                                </span>
                                <span className="text-xs text-gray-500">
                                    {format(new Date(rfq.created_at), 'MMM dd')}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{rfq.title}</h3>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-3">{rfq.description}</p>

                            <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
                                <span>Status: {rfq.status}</span>
                                <button
                                    onClick={() => setSelectedRFQ(rfq)}
                                    className="text-primary font-medium hover:text-blue-700 flex items-center"
                                >
                                    View & Quote <LucideChevronRight className="w-4 h-4 ml-1" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
