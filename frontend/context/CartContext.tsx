"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";

export interface CartItem {
    id: string; // The specific item ID in the cart
    product_id: string;
    quantity: number;
    product_name: string;
    price: number;
    image_url?: string;
}

interface CartState {
    id: string; // Cart ID
    items: CartItem[];
    total_price: number;
}

interface CartContextType {
    cart: CartState | null;
    loading: boolean;
    addToCart: (productId: string, quantity: number) => Promise<void>;
    removeFromCart: (itemId: string) => Promise<void>;
    updateQuantity: (itemId: string, quantity: number) => Promise<void>;
    refreshCart: () => Promise<void>;
    itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const { user, token } = useAuth();
    const [cart, setCart] = useState<CartState | null>(null);
    const [loading, setLoading] = useState(false);

    // Fetch cart on load or user change
    useEffect(() => {
        if (user && token) {
            refreshCart();
        } else {
            setCart(null);
        }
    }, [user, token]);

    const refreshCart = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setCart(data);
            }
        } catch (err) {
            console.error("Failed to fetch cart", err);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (productId: string, quantity: number = 1) => {
        if (!token) throw new Error("Please log in to add items.");

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/items`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ product_id: productId, quantity }),
            });

            if (!res.ok) throw new Error("Failed to add to cart");

            const updatedCart = await res.json();
            setCart(updatedCart);
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    const removeFromCart = async (itemId: string) => {
        if (!token) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/items/${itemId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const updatedCart = await res.json();
                setCart(updatedCart);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const updateQuantity = async (itemId: string, quantity: number) => {
        if (!token) return;
        if (quantity <= 0) {
            return removeFromCart(itemId);
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/items/${itemId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ quantity }),
            });
            if (res.ok) {
                const updatedCart = await res.json();
                setCart(updatedCart);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Derived state
    const itemCount = cart?.items.reduce((acc, item) => acc + item.quantity, 0) || 0;

    return (
        <CartContext.Provider value={{ cart, loading, addToCart, removeFromCart, updateQuantity, refreshCart, itemCount }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
