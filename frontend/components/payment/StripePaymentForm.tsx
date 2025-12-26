"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements
} from "@stripe/react-stripe-js";
import { usePayment } from "@/context/PaymentContext";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

interface StripePaymentFormProps {
    orderId: string;
    amount: number;
    onSuccess: () => void;
    onError: (error: string) => void;
}

function PaymentForm({ orderId, onSuccess, onError }: Omit<StripePaymentFormProps, "amount">) {
    const stripe = useStripe();
    const elements = useElements();
    const { setPaymentStatus } = usePayment();
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);
        setErrorMessage(null);
        setPaymentStatus("processing");

        try {
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/orders/${orderId}/success`,
                },
                redirect: "if_required"
            });

            if (error) {
                setErrorMessage(error.message || "Payment failed");
                setPaymentStatus("failed");
                onError(error.message || "Payment failed");
            } else if (paymentIntent && paymentIntent.status === "succeeded") {
                setPaymentStatus("succeeded");
                onSuccess();
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "An unexpected error occurred";
            setErrorMessage(message);
            setPaymentStatus("failed");
            onError(message);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="min-h-[200px]">
                <PaymentElement />
            </div>

            {errorMessage && (
                <div className="text-red-600 dark:text-red-400 text-sm">
                    {errorMessage}
                </div>
            )}

            <Button
                type="submit"
                disabled={!stripe || isProcessing}
                className="w-full"
                size="lg"
            >
                {isProcessing ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                    </>
                ) : (
                    "Pay Now"
                )}
            </Button>

            <p className="text-xs text-gray-500 text-center">
                Your payment information is encrypted and secure.
            </p>
        </form>
    );
}

export function StripePaymentForm({ orderId, amount, onSuccess, onError }: StripePaymentFormProps) {
    const { createStripePayment } = usePayment();
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializePayment = async () => {
            try {
                const { clientSecret } = await createStripePayment(orderId);
                setClientSecret(clientSecret);
            } catch (error) {
                const message = error instanceof Error ? error.message : "Failed to initialize payment";
                onError(message);
            } finally {
                setIsLoading(false);
            }
        };

        initializePayment();
    }, [orderId]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!clientSecret) {
        return (
            <div className="text-center text-red-600 dark:text-red-400">
                Failed to initialize payment. Please try again.
            </div>
        );
    }

    const options = {
        clientSecret,
        appearance: {
            theme: 'stripe' as const,
        },
    };

    return (
        <Elements stripe={stripePromise} options={options}>
            <PaymentForm orderId={orderId} onSuccess={onSuccess} onError={onError} />
        </Elements>
    );
}
