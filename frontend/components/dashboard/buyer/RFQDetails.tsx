"use client";

import { useEffect, useState } from "react";
import { useRFQ, RFQ, Quote } from "@/context/RFQContext";
import { format } from "date-fns";
import { LucideArrowLeft, LucideCheck, LucideX, LucidePaperclip } from "lucide-react";
import { QuoteComparison } from "./QuoteComparison";

interface RFQDetailsProps {
    rfq: RFQ;
    onBack: () => void;
}

export function RFQDetails({ rfq, onBack }: RFQDetailsProps) {
    const { quotes, fetchQuotes, updateQuoteStatus, loading } = useRFQ();
    const [showComparison, setShowComparison] = useState(false);

    useEffect(() => {
        fetchQuotes(rfq.id);
    }, [rfq.id]);

    const handleAcceptQuote = async (quote: Quote) => {
        if (confirm(`Accept quote from vendor for ${quote.price} ${quote.currency}? This will create an order.`)) {
            await updateQuoteStatus(quote.id, "accepted");
            onBack(); // Go back to refresh list or show success
        }
    };

    if (showComparison) {
        return <QuoteComparison rfq={rfq} quotes={quotes} onBack={() => setShowComparison(false)} onAccept={handleAcceptQuote} />;
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <button onClick={onBack} className="flex items-center text-gray-500 hover:text-gray-900 mb-6">
                <LucideArrowLeft className="w-4 h-4 mr-2" /> Back to RFQs
            </button>

            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{rfq.title}</h1>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Created: {format(new Date(rfq.created_at), 'PPP')}</span>
                        <span>ID: {rfq.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${rfq.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100'
                            }`}>
                            {rfq.status.toUpperCase()}
                        </span>
                    </div>
                </div>
                {quotes.length > 1 && (
                    <button
                        onClick={() => setShowComparison(true)}
                        className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Compare Quotes ({quotes.length})
                    </button>
                )}
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-8">
                <div className="md:col-span-2 space-y-6">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Description</h3>
                        <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{rfq.description}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Requirements</h3>
                        <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{rfq.requirements || "No specific requirements."}</p>
                    </div>
                </div>
                <div className="space-y-6">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Details</h3>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Quantity</span>
                                <span className="font-medium">{rfq.quantity}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Target Price</span>
                                <span className="font-medium">{rfq.target_price ? `$${rfq.target_price}` : 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                    {rfq.attachments && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Attachments</h3>
                            <div className="flex flex-col gap-2">
                                <a href="#" className="flex items-center text-primary hover:underline text-sm">
                                    <LucidePaperclip className="w-4 h-4 mr-2" /> View Attachment
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <h2 className="text-xl font-bold mb-4">Received Quotes</h2>
            {quotes.length === 0 ? (
                <p className="text-gray-500 italic">No quotes received yet.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Vendor</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Delivery</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Notes</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {quotes.map((quote) => (
                                <tr key={quote.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Vendor #{quote.vendor_id.substring(0, 8)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                                        {quote.price} {quote.currency}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{quote.delivery_time}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{quote.notes}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                        {quote.status === 'pending' && (
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleAcceptQuote(quote)}
                                                    className="bg-green-50 text-green-600 hover:bg-green-100 p-2 rounded-full"
                                                    title="Accept"
                                                >
                                                    <LucideCheck className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => updateQuoteStatus(quote.id, "rejected")}
                                                    className="bg-red-50 text-red-600 hover:bg-red-100 p-2 rounded-full"
                                                    title="Reject"
                                                >
                                                    <LucideX className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                        {quote.status === 'accepted' && <span className="text-green-600 font-bold">Accepted</span>}
                                        {quote.status === 'rejected' && <span className="text-red-400">Rejected</span>}
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
