"use client";

import { useRouter } from "next/navigation";
import { useCart } from "../lib/cart-context";

export default function AddToCartButton({ card }) {
  const { items, addToCart, updateQty } = useCart();
  const router = useRouter();
  const cartItem = items.find((i) => i.id === card.id);
  const maxQty = card.quantity || 1;
  const isStockItem = maxQty > 1;
  const atLimit = cartItem && cartItem.qty >= maxQty;

  if (card.sold) {
    return <button className="btn btn-secondary" disabled>Sold out</button>;
  }

  // Unique one-of-a-kind items keep the original simple behavior — one unit,
  // no quantity stepper. Multi-unit stock items (sealed product, merch) get a
  // stepper so a customer can buy more than one in the same order.
  if (!isStockItem) {
    const inCart = !!cartItem;
    return (
      <div style={{ display: "flex", gap: 12 }}>
        <button className="btn btn-primary" disabled={inCart} onClick={() => addToCart({ ...card, maxQty: card.quantity || 1 })}>
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

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      {cartItem ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, border: "1px solid var(--line)", borderRadius: 4, padding: "6px 10px" }}>
          <button
            type="button"
            onClick={() => updateQty(card.id, cartItem.qty - 1)}
            style={{ background: "none", border: "none", color: "var(--white)", fontSize: 16, cursor: "pointer", width: 20 }}
          >
            −
          </button>
          <span style={{ fontSize: 14, minWidth: 18, textAlign: "center" }}>{cartItem.qty}</span>
          <button
            type="button"
            disabled={atLimit}
            onClick={() => addToCart({ ...card, maxQty: card.quantity || 1 })}
            style={{ background: "none", border: "none", color: atLimit ? "var(--grey-dim)" : "var(--white)", fontSize: 16, cursor: atLimit ? "not-allowed" : "pointer", width: 20 }}
          >
            +
          </button>
        </div>
      ) : (
        <button className="btn btn-primary" onClick={() => addToCart({ ...card, maxQty: card.quantity || 1 })}>
          Add to cart
        </button>
      )}
      {cartItem && (
        <button className="btn btn-secondary" onClick={() => router.push("/cart")}>
          View cart
        </button>
      )}
      <span style={{ fontSize: 12.5, color: "var(--grey-dim)" }}>
        {atLimit ? `Max ${maxQty} in stock` : `${maxQty} in stock`}
      </span>
    </div>
  );
}
