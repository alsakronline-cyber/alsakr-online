"use client";

import { useState } from "react";
import { useRFQ, RFQ } from "@/context/RFQContext";
import { LucideArrowLeft, LucideLoader } from "lucide-react";

interface QuoteFormProps {
    rfq: RFQ;
    onBack: () => void;
}

export function QuoteForm({ rfq, onBack }: QuoteFormProps) {
    const { submitQuote } = useRFQ();
    const [price, setPrice] = useState("");
    const [deliveryTime, setDeliveryTime] = useState("");
    const [notes, setNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await submitQuote({
                rfq_id: rfq.id,
                price: parseFloat(price),
                delivery_time: deliveryTime,
                notes,
                currency: "USD" // Default for now
            });
            alert("Quote submitted successfully!");
            onBack();
        } catch (err) {
            alert("Failed to submit quote.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
            <button onClick={onBack} className="flex items-center text-gray-500 hover:text-gray-900 mb-6">
                <LucideArrowLeft className="w-4 h-4 mr-2" /> Back to Marketplace
            </button>

            <h2 className="text-2xl font-bold mb-2">Submit Quote</h2>
            <p className="text-gray-500 mb-6">For RFQ: {rfq.title}</p>

            <div className="bg-gray-50 p-4 rounded-lg mb-8 text-sm text-gray-700">
                <p><strong>Quantity:</strong> {rfq.quantity}</p>
                <p><strong>Description:</strong> {rfq.description}</p>
                {rfq.target_price && <p><strong>Target Price:</strong> ${rfq.target_price}</p>}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (USD)</label>
                    <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary p-2 border"
                        placeholder="0.00"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Time</label>
                    <select
                        required
                        value={deliveryTime}
                        onChange={(e) => setDeliveryTime(e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary p-2 border"
                    >
                        <option value="">Select duration...</option>
                        <option value="1-3 days">1-3 Days</option>
                        <option value="1 week">1 Week</option>
                        <option value="2 weeks">2 Weeks</option>
                        <option value="1 month">1 Month</option>
                        <option value="> 1 month">More than 1 Month</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Conditions</label>
                    <textarea
                        rows={4}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary p-2 border"
                        placeholder="Include warranty info, shipping terms, etc."
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center"
                >
                    {isSubmitting ? <LucideLoader className="animate-spin" /> : "Submit Quote"}
                </button>
            </form>
        </div>
    );
}
