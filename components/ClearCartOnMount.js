"use client";

import { useEffect, useRef } from "react";
import { useCart } from "../lib/cart-context";

export default function ClearCartOnMount() {
  const { clearCart, loaded } = useCart();
  const cleared = useRef(false);

  useEffect(() => {
    // Wait until the cart has actually finished loading from localStorage —
    // clearing before that point gets silently overwritten by the load.
    if (loaded && !cleared.current) {
      cleared.current = true;
      clearCart();
    }
  }, [loaded, clearCart]);

  return null;
}
