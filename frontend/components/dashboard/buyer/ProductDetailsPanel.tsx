"use client";

import { useRFQ } from "@/context/RFQContext";
import { useState } from "react";

interface ProductDetailsPanelProps {
    part: any;
    onClose: () => void;
}

export function ProductDetailsPanel({ part, onClose }: ProductDetailsPanelProps) {
    const { createRFQ } = useRFQ();
    const [requesting, setRequesting] = useState(false);

    const handleRequestQuote = async () => {
        try {
            setRequesting(true);
            // Create a general RFQ for this part
            await createRFQ({
                title: `RFQ for ${part.payload.part_number}`,
                description: `Requesting quote for ${part.payload.part_number} (${part.payload.manufacturer}). ${part.payload.description_en}`,
                quantity: 1, // Default quantity
            });
            alert("RFQ Created Successfully! Check 'My RFQs' tab.");
            onClose();
        } catch (error) {
            console.error("Failed to create RFQ:", error);
            alert("Failed to create RFQ. Please try again.");
        } finally {
            setRequesting(false);
        }
    };

    return (
        <div className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-slate-900 border-l border-white/10 shadow-2xl p-6 overflow-y-auto transform transition-transform animate-in slide-in-from-right z-50">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
                ✕
            </button>

            <div className="mt-8">
                {part.payload.image_url && (
                    <div className="bg-white p-4 rounded-xl mb-6">
                        <img
                            src={part.payload.image_url}
                            alt={part.payload.part_number}
                            className="w-full h-48 object-contain"
                        />
                    </div>
                )}

                <h2 className="text-2xl font-bold mb-2 text-white">{part.payload.part_number}</h2>
                <p className="text-primary font-medium mb-6">{part.payload.manufacturer}</p>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Description</h3>
                        <p className="text-gray-300">{part.payload.description_en}</p>
                    </div>

                    {part.payload.specs && (
                        <div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Specifications</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {Object.entries(part.payload.specs).map(([key, value]: any) => (
                                    <div key={key} className="bg-white/5 p-3 rounded-lg">
                                        <div className="text-xs text-gray-500 mb-1">{key}</div>
                                        <div className="text-sm font-medium text-white">{value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-8 pt-6 border-t border-white/10">
                    <button
                        onClick={handleRequestQuote}
                        disabled={requesting}
                        className="w-full bg-primary hover:bg-blue-600 disabled:bg-gray-700 text-white font-bold py-3 rounded-xl transition-colors"
                    >
                        {requesting ? 'Submitting...' : 'Request Quote'}
                    </button>
                </div>
            </div>
        </div>
    );
}
