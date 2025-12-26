"use client";

import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
    const { cart, refreshCart } = useCart();
    const { token } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        shipping_address: "",
        notes: ""
    });
    const [error, setError] = useState("");

    if (!cart || cart.items.length === 0) {
        if (typeof window !== 'undefined') router.push("/cart");
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!formData.shipping_address.trim()) {
            setError("Shipping address is required");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/checkout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.detail || "Checkout failed");
            }

            const order = await res.json();
            await refreshCart(); // Cart should be empty now
            router.push(`/dashboard/orders`); // Redirect to orders list

        } catch (err: any) {
            console.error(err);
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Shipping Form */}
                <div>
                    <h2 className="text-xl font-semibold mb-6">Shipping Details</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Shipping Address</label>
                            <textarea
                                required
                                rows={4}
                                className="w-full p-3 border rounded-md bg-background"
                                placeholder="Enter full shipping address..."
                                value={formData.shipping_address}
                                onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Order Notes (Optional)</label>
                            <textarea
                                rows={2}
                                className="w-full p-3 border rounded-md bg-background"
                                placeholder="Special instructions..."
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>

                        {error && <div className="text-red-500 text-sm">{error}</div>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold hover:bg-primary/90 transition disabled:opacity-50"
                        >
                            {loading ? "Processing..." : `Place Order ($${cart.total_price.toFixed(2)})`}
                        </button>
                    </form>
                </div>

                {/* Order Preview */}
                <div className="bg-muted/30 p-6 rounded-lg h-fit">
                    <h2 className="text-xl font-semibold mb-4">Your Order</h2>
                    <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2">
                        {cart.items.map(item => (
                            <div key={item.id} className="flex justify-between items-center text-sm">
                                <div>
                                    <span className="font-medium">{item.product_name}</span>
                                    <div className="text-muted-foreground">Qty: {item.quantity} × ${item.price.toFixed(2)}</div>
                                </div>
                                <div className="font-semibold">${(item.price * item.quantity).toFixed(2)}</div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>${cart.total_price.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
