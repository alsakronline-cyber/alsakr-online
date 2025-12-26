"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { useAuth } from "./AuthContext";

// Types matching Backend Models
export interface RFQ {
    id: string;
    title: string;
    description: string;
    quantity: number;
    target_price?: number;
    status: "open" | "quoted" | "closed" | "cancelled";
    created_at: string;
    buyer_id: string;
    part_description?: string;
    requirements?: string;
    attachments?: string; // Comma separated URLs
}

export interface Quote {
    id: string;
    rfq_id: string;
    vendor_id: string;
    price: number;
    currency: string;
    delivery_time: string;
    status: "pending" | "accepted" | "rejected";
    notes?: string;
    created_at: string;
    is_winner?: boolean;
}

interface RFQContextType {
    rfqs: RFQ[];
    quotes: Quote[];
    loading: boolean;
    fetchRFQs: (role: "buyer" | "vendor" | "both" | "admin") => Promise<void>;
    fetchQuotes: (rfq_id?: string) => Promise<void>;
    createRFQ: (data: any) => Promise<void>;
    submitQuote: (data: any) => Promise<void>;
    updateQuoteStatus: (quoteId: string, status: "accepted" | "rejected") => Promise<void>;
}

const RFQContext = createContext<RFQContextType | undefined>(undefined);

export function RFQProvider({ children }: { children: ReactNode }) {
    const { token } = useAuth();
    const [rfqs, setRfqs] = useState<RFQ[]>([]);
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(false);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.app.alsakronline.com';

    const fetchRFQs = async (role: string) => {
        if (!token) return;
        setLoading(true);
        try {
            // Role logic handled by backend based on token's user
            const res = await fetch(`${apiUrl}/api/rfqs`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setRfqs(data.rfqs);
            }
        } catch (err) {
            console.error("Failed to fetch RFQs", err);
        } finally {
            setLoading(false);
        }
    };

    const createRFQ = async (data: any) => {
        if (!token) return;
        setLoading(true);
        try {
            await fetch(`${apiUrl}/api/rfqs`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            // Refresh list
            await fetchRFQs("buyer");
        } catch (err) {
            console.error("Failed to create RFQ", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchQuotes = async (rfq_id?: string) => {
        if (!token) return;
        setLoading(true);
        try {
            let url = `${apiUrl}/api/quotes`;
            if (rfq_id) url += `?rfq_id=${rfq_id}`;

            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setQuotes(data.quotes);
            }
        } catch (err) {
            console.error("Failed to fetch Quotes", err);
        } finally {
            setLoading(false);
        }
    };

    const submitQuote = async (data: any) => {
        if (!token) return;
        setLoading(true);
        try {
            await fetch(`${apiUrl}/api/quotes`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
        } catch (err) {
            console.error("Failed to submit quote", err);
        } finally {
            setLoading(false);
        }
    };

    const updateQuoteStatus = async (quoteId: string, status: "accepted" | "rejected") => {
        if (!token) return;
        setLoading(true);
        try {
            await fetch(`${apiUrl}/api/quotes/${quoteId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });
            // Refresh quotes
            // Ideally we also refresh RFQs if acceptance closes the RFQ
        } catch (err) {
            console.error("Failed to update quote status", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <RFQContext.Provider value={{ rfqs, quotes, loading, fetchRFQs, fetchQuotes, createRFQ, submitQuote, updateQuoteStatus }}>
            {children}
        </RFQContext.Provider>
    );
}

export function useRFQ() {
    const context = useContext(RFQContext);
    if (!context) throw new Error("useRFQ must be used within RFQProvider");
    return context;
}
