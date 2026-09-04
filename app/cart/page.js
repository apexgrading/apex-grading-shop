"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "../../lib/cart-context";

function formatPrice(cents) {
  return `$${(cents / 100).toLocaleString()}`;
}

export default function CartPage() {
  const { items, removeFromCart, total, loaded } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState(null);

  async function handleCheckout() {
    setError(null);
    setCheckingOut(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardIds: items.map((i) => i.id) }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Something went wrong starting checkout.");
        setCheckingOut(false);
        return;
      }
      window.location.href = json.url;
    } catch (e) {
      setError("Couldn't reach checkout. Please try again.");
      setCheckingOut(false);
    }
  }

  if (!loaded) return null;

  return (
    <div className="wrap" style={{ padding: "48px 0 100px" }}>
      <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(28px,3vw,38px)", margin: "0 0 8px" }}>
        Your cart
      </h1>
      <p style={{ color: "var(--grey)", fontSize: 14.5, margin: "0 0 8px" }}>
        Each graded card is a single unique unit — once it's sold, it's off the site.
      </p>

      {items.length === 0 ? (
        <div className="empty-state">
          <h3>Your cart is empty</h3>
          <p>Browse the catalog and add a card to get started.</p>
          <Link href="/shop" className="btn btn-primary">Shop graded cards</Link>
        </div>
      ) : (
        <>
          <div className="cart-list">
            {items.map((item) => (
              <div className="cart-row" key={item.id}>
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} />
                ) : (
                  <div className="thumb">{item.grade}</div>
                )}
                <div>
                  <h4>{item.title}</h4>
                  <div className="meta">{item.category} · Grade {item.grade} · Cert {item.cert}</div>
                </div>
                <div className="price">{formatPrice(item.price)}</div>
                <button className="remove" onClick={() => removeFromCart(item.id)}>Remove</button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <span>Total ({items.length} card{items.length === 1 ? "" : "s"})</span>
            <span className="total">{formatPrice(total)}</span>
          </div>

          {error && (
            <p style={{ color: "#E08A7D", fontSize: 14, marginBottom: 16 }}>{error}</p>
          )}

          <button className="btn btn-primary" onClick={handleCheckout} disabled={checkingOut}>
            {checkingOut ? "Redirecting to checkout…" : "Checkout with Stripe"}
          </button>
        </>
      )}
    </div>
  );
}
