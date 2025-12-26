"use client";

import { useState } from "react";
import { usePayment } from "@/context/PaymentContext";
import { StripePaymentForm } from "../payment/StripePaymentForm";
import { PayPalButton } from "../payment/PayPalButton";
import { CreditCard, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CheckoutPaymentProps {
    orderId: string;
    amount: number;
    onSuccess: () => void;
    onError: (error: string) => void;
}

export function CheckoutPayment({ orderId, amount, onSuccess, onError }: CheckoutPaymentProps) {
    const { selectedProvider, setSelectedProvider, paymentStatus } = usePayment();
    const [clientSecret, setClientSecret] = useState<string | null>(null);

    return (
        <div className="space-y-6">
            {/* Payment Method Selection */}
            <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-4">Select Payment Method</h3>
                <div className="grid grid-cols-2 gap-4">
                    <Button
                        variant={selectedProvider === "stripe" ? "default" : "outline"}
                        className="h-20 flex flex-col items-center justify-center gap-2"
                        onClick={() => setSelectedProvider("stripe")}
                    >
                        <CreditCard className="h-6 w-6" />
                        <span>Credit Card</span>
                    </Button>
                    <Button
                        variant={selectedProvider === "paypal" ? "default" : "outline"}
                        className="h-20 flex flex-col items-center justify-center gap-2"
                        onClick={() => setSelectedProvider("paypal")}
                    >
                        <Wallet className="h-6 w-6" />
                        <span>PayPal</span>
                    </Button>
                </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span>${amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                    <span>Calculated at next step</span>
                </div>
                <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>${amount.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Payment Form */}
            <div className="border rounded-lg p-6">
                {selectedProvider === "stripe" && (
                    <StripePaymentForm
                        orderId={orderId}
                        amount={amount}
                        onSuccess={onSuccess}
                        onError={onError}
                    />
                )}

                {selectedProvider === "paypal" && (
                    <PayPalButton
                        orderId={orderId}
                        amount={amount}
                        onSuccess={onSuccess}
                        onError={onError}
                    />
                )}
            </div>

            {/* Payment Status */}
            {paymentStatus === "processing" && (
                <div className="text-center text-blue-600 dark:text-blue-400">
                    Processing payment...
                </div>
            )}

            {paymentStatus === "failed" && (
                <div className="text-center text-red-600 dark:text-red-400">
                    Payment failed. Please try again.
                </div>
            )}
        </div>
    );
}
