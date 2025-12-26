"use client";
import { useCart } from "@/context/CartContext";

export default function CartCount() {
    const { itemCount } = useCart();
    return <>{itemCount}</>;
}
