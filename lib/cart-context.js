"use client";

import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "apex-cart";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]); // [{ id, title, price, grade, category, imageUrl, cert, qty, maxQty }]
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Backfill qty for carts saved before quantity support existed.
        setItems(parsed.map((i) => ({ ...i, qty: i.qty || 1 })));
      }
    } catch (e) {
      // ignore corrupt storage
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, loaded]);

  // `card.maxQty` (stock available) is optional — unique one-of-a-kind cards
  // simply won't have it and behave exactly as before (one unit, no duplicates
  // possible since maxQty defaults to 1 when absent).
  function addToCart(card) {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === card.id);
      const max = card.maxQty || 1;
      if (existing) {
        if (existing.qty >= max) return prev; // already at stock limit
        return prev.map((i) => (i.id === card.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { ...card, qty: 1, maxQty: max }];
    });
  }

  function updateQty(id, qty) {
    setItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: Math.max(1, Math.min(qty, i.maxQty || 1)) } : i))
    );
  }

  function removeFromCart(id) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function clearCart() {
    setItems([]);
  }

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, updateQty, removeFromCart, clearCart, total, itemCount, loaded }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
