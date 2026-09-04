"use client";

import { useRouter } from "next/navigation";
import { useCart } from "../lib/cart-context";

export default function AddToCartButton({ card }) {
  const { items, addToCart } = useCart();
  const router = useRouter();
  const inCart = items.some((i) => i.id === card.id);

  if (card.sold) {
    return <button className="btn btn-secondary" disabled>Sold</button>;
  }

  return (
    <div style={{ display: "flex", gap: 12 }}>
      <button
        className="btn btn-primary"
        disabled={inCart}
        onClick={() => addToCart(card)}
      >
        {inCart ? "Already in cart" : "Add to cart"}
      </button>
      {inCart && (
        <button className="btn btn-secondary" onClick={() => router.push("/cart")}>
          View cart
        </button>
      )}
    </div>
  );
}
