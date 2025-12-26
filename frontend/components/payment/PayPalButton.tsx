"use client";

import { useEffect, useRef } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { usePayment } from "@/context/PaymentContext";

interface PayPalButtonProps {
    orderId: string;
    amount: number;
    onSuccess: () => void;
    onError: (error: string) => void;
}

function PayPalButtonComponent({ orderId, amount, onSuccess, onError }: PayPalButtonProps) {
    const { createPayPalOrder, capturePayPalOrder, setPaymentStatus } = usePayment();

    return (
        <PayPalButtons
            style={{ layout: "vertical", label: "pay" }}
            createOrder={async () => {
                try {
                    setPaymentStatus("processing");
                    const { paypalOrderId } = await createPayPalOrder(orderId);
                    return paypalOrderId;
                } catch (error) {
                    const message = error instanceof Error ? error.message : "Failed to create PayPal order";
                    onError(message);
                    setPaymentStatus("failed");
                    throw error;
                }
            }}
            onApprove={async (data) => {
                try {
                    const result = await capturePayPalOrder(data.orderID);

                    if (result.status === "COMPLETED") {
                        setPaymentStatus("succeeded");
                        onSuccess();
                    } else {
                        setPaymentStatus("failed");
                        onError("Payment approval failed");
                    }
                } catch (error) {
                    const message = error instanceof Error ? error.message : "Failed to capture payment";
                    onError(message);
                    setPaymentStatus("failed");
                }
            }}
            onError={(err) => {
                const message = typeof err === "string" ? err : "PayPal error occurred";
                onError(message);
                setPaymentStatus("failed");
            }}
            onCancel={() => {
                setPaymentStatus("idle");
                onError("Payment cancelled");
            }}
        />
    );
}

export function PayPalButton(props: PayPalButtonProps) {
    const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

    if (!paypalClientId) {
        return (
            <div className="text-red-600 dark:text-red-400 text-center">
                PayPal is not configured. Please contact support.
            </div>
        );
    }

    return (
        <PayPalScriptProvider
            options={{
                clientId: paypalClientId,
                currency: "USD",
                intent: "capture",
            }}
        >
            <div className="space-y-4">
                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                    Amount: ${props.amount.toFixed(2)} USD
                </div>
                <PayPalButtonComponent {...props} />
                <p className="text-xs text-gray-500 text-center mt-4">
                    You will be redirected to PayPal to complete your payment securely.
                </p>
            </div>
        </PayPalScriptProvider>
    );
}
