"use client";

import { RFQ, Quote } from "@/context/RFQContext";
import { LucideArrowLeft, LucideCheckCircle } from "lucide-react";

interface QuoteComparisonProps {
    rfq: RFQ;
    quotes: Quote[];
    onBack: () => void;
    onAccept: (quote: Quote) => void;
}

export function QuoteComparison({ rfq, quotes, onBack, onAccept }: QuoteComparisonProps) {
    if (quotes.length === 0) return <div>No quotes to compare.</div>;

    // Determine best values for highlighting
    const bestPrice = Math.min(...quotes.map(q => q.price));
    // Simple delivery parsing assumption: "2 weeks", "5 days". Ideally backend normalizes this.

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <button onClick={onBack} className="flex items-center text-gray-500 hover:text-gray-900 mb-6">
                <LucideArrowLeft className="w-4 h-4 mr-2" /> Back to Details
            </button>

            <h2 className="text-2xl font-bold mb-6">Quote Comparison for "{rfq.title}"</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {quotes.map((quote) => {
                    const isBestPrice = quote.price === bestPrice;

                    return (
                        <div key={quote.id} className={`border rounded-xl p-6 relative flex flex-col ${isBestPrice ? 'border-green-400 ring-1 ring-green-400' : 'border-gray-200'}`}>
                            {isBestPrice && (
                                <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                                    Best Price
                                </div>
                            )}

                            <h3 className="font-bold text-gray-700 mb-4">Vendor #{quote.vendor_id.substring(0, 8)}</h3>

                            <div className="flex-1 space-y-4 mb-6">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Price</p>
                                    <p className="text-3xl font-bold text-gray-900">{quote.price} <span className="text-base font-normal text-gray-500">{quote.currency}</span></p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Delivery Time</p>
                                    <p className="font-medium text-gray-900">{quote.delivery_time}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Notes</p>
                                    <p className="text-sm text-gray-600 line-clamp-3">{quote.notes || "No notes provided."}</p>
                                </div>
                            </div>

                            {quote.status === 'pending' ? (
                                <button
                                    onClick={() => onAccept(quote)}
                                    className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    Accept Quote
                                </button>
                            ) : quote.status === 'accepted' ? (
                                <div className="w-full bg-green-100 text-green-700 font-bold py-3 rounded-lg flex items-center justify-center gap-2">
                                    <LucideCheckCircle className="w-5 h-5" /> Accepted
                                </div>
                            ) : (
                                <div className="w-full bg-gray-100 text-gray-500 font-bold py-3 rounded-lg text-center">
                                    Rejected
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
