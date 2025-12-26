"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { useAuth } from "./AuthContext";

export type PaymentProvider = "stripe" | "paypal";
export type PaymentStatus = "idle" | "processing" | "succeeded" | "failed";

interface PaymentContextType {
    selectedProvider: PaymentProvider;
    setSelectedProvider: (provider: PaymentProvider) => void;
    paymentStatus: PaymentStatus;
    setPaymentStatus: (status: PaymentStatus) => void;
    createStripePayment: (orderId: string) => Promise<{ clientSecret: string; paymentIntentId: string }>;
    createPayPalOrder: (orderId: string) => Promise<{ paypalOrderId: string; approvalUrl: string }>;
    capturePayPalOrder: (paypalOrderId: string) => Promise<any>;
    getPaymentStatus: (paymentId: string) => Promise<any>;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export function PaymentProvider({ children }: { children: ReactNode }) {
    const { token } = useAuth();
    const [selectedProvider, setSelectedProvider] = useState<PaymentProvider>("stripe");
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("idle");

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.app.alsakronline.com';

    const createStripePayment = async (orderId: string) => {
        if (!token) throw new Error("Not authenticated");

        setPaymentStatus("processing");

        try {
            const res = await fetch(`${apiUrl}/api/payments/stripe/create-intent?order_id=${orderId}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.detail || "Failed to create payment");
            }

            const data = await res.json();
            return {
                clientSecret: data.client_secret,
                paymentIntentId: data.payment_intent_id
            };
        } catch (error) {
            setPaymentStatus("failed");
            throw error;
        }
    };

    const createPayPalOrder = async (orderId: string) => {
        if (!token) throw new Error("Not authenticated");

        setPaymentStatus("processing");

        try {
            const res = await fetch(`${apiUrl}/api/payments/paypal/create-order?order_id=${orderId}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.detail || "Failed to create PayPal order");
            }

            const data = await res.json();
            return {
                paypalOrderId: data.paypal_order_id,
                approvalUrl: data.approval_url
            };
        } catch (error) {
            setPaymentStatus("failed");
            throw error;
        }
    };

    const capturePayPalOrder = async (paypalOrderId: string) => {
        if (!token) throw new Error("Not authenticated");

        try {
            const res = await fetch(`${apiUrl}/api/payments/paypal/capture?paypal_order_id=${paypalOrderId}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.detail || "Failed to capture payment");
            }

            const data = await res.json();

            if (data.status === "COMPLETED") {
                setPaymentStatus("succeeded");
            } else {
                setPaymentStatus("failed");
            }

            return data;
        } catch (error) {
            setPaymentStatus("failed");
            throw error;
        }
    };

    const getPaymentStatus = async (paymentId: string) => {
        if (!token) throw new Error("Not authenticated");

        try {
            const res = await fetch(`${apiUrl}/api/payments/${paymentId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!res.ok) {
                throw new Error("Failed to fetch payment status");
            }

            return await res.json();
        } catch (error) {
            console.error("Error fetching payment status:", error);
            throw error;
        }
    };

    return (
        <PaymentContext.Provider value={{
            selectedProvider,
            setSelectedProvider,
            paymentStatus,
            setPaymentStatus,
            createStripePayment,
            createPayPalOrder,
            capturePayPalOrder,
            getPaymentStatus
        }}>
            {children}
        </PaymentContext.Provider>
    );
}

export function usePayment() {
    const context = useContext(PaymentContext);
    if (!context) throw new Error("usePayment must be used within PaymentProvider");
    return context;
}
