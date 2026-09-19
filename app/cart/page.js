"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "../../lib/cart-context";
import { SHIPPING_REGIONS, FREE_SHIPPING_THRESHOLD } from "../../lib/shipping";
import PaymentBadges from "../../components/PaymentBadges";

function formatPrice(cents) {
  return `£${(cents / 100).toLocaleString()}`;
}

export default function CartPage() {
  const { items, removeFromCart, updateQty, total, itemCount, loaded } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState(null);
  const [region, setRegion] = useState("uk");

  async function handleCheckout() {
    setError(null);
    setCheckingOut(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: items.map((i) => ({ id: i.id, qty: i.qty })), region }),
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

  const selectedRegion = SHIPPING_REGIONS[region];

  return (
    <div className="wrap" style={{ padding: "48px 0 100px" }}>
      <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(28px,3vw,38px)", margin: "0 0 8px" }}>
        Your cart
      </h1>
      <p style={{ color: "var(--grey)", fontSize: 14.5, margin: "0 0 8px" }}>
        Graded cards are single unique units — once sold, they're off the site. Sealed product and merch may have more than one in stock.
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
                  <div className="meta">
                    {item.category}
                    {item.grade ? ` · Grade ${item.grade}` : ""}
                    {item.cert ? ` · Cert ${item.cert}` : ""}
                  </div>
                  {item.maxQty > 1 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, item.qty - 1)}
                        style={{ background: "var(--bg-panel)", border: "1px solid var(--line)", borderRadius: 4, color: "var(--white)", width: 26, height: 26, cursor: "pointer" }}
                      >
                        −
                      </button>
                      <span style={{ fontSize: 14, minWidth: 18, textAlign: "center" }}>{item.qty}</span>
                      <button
                        type="button"
                        disabled={item.qty >= item.maxQty}
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        style={{ background: "var(--bg-panel)", border: "1px solid var(--line)", borderRadius: 4, color: item.qty >= item.maxQty ? "var(--grey-dim)" : "var(--white)", width: 26, height: 26, cursor: item.qty >= item.maxQty ? "not-allowed" : "pointer" }}
                      >
                        +
                      </button>
                      <span style={{ fontSize: 12, color: "var(--grey-dim)" }}>({item.maxQty} in stock)</span>
                    </div>
                  )}
                </div>
                <div className="price">{formatPrice(item.price * item.qty)}</div>
                <button className="remove" onClick={() => removeFromCart(item.id)}>Remove</button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <span>Total ({itemCount} item{itemCount === 1 ? "" : "s"})</span>
            <span className="total">{formatPrice(total)}</span>
          </div>

          {total >= FREE_SHIPPING_THRESHOLD ? (
            <p style={{ fontSize: 13, color: "var(--gold-light)", margin: "0 0 20px" }}>
              ✓ You qualify for free standard shipping (order over {formatPrice(FREE_SHIPPING_THRESHOLD)})
            </p>
          ) : (
            <p style={{ fontSize: 13, color: "var(--grey-dim)", margin: "0 0 20px" }}>
              Add {formatPrice(FREE_SHIPPING_THRESHOLD - total)} more for free standard shipping
            </p>
          )}

          <div style={{ margin: "8px 0 20px" }}>
            <label style={{ display: "block", fontSize: 13.5, color: "var(--grey)", marginBottom: 8 }}>Shipping to</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              style={{
                width: "100%", background: "var(--bg-panel)", border: "1px solid var(--line)",
                borderRadius: 4, padding: "11px 12px", color: "var(--white)", fontSize: 14.5,
              }}
            >
              {Object.entries(SHIPPING_REGIONS).map(([key, r]) => (
                <option key={key} value={key}>{r.label}</option>
              ))}
            </select>
            <p style={{ fontSize: 13, color: "var(--grey-dim)", margin: "10px 0 0" }}>
              {selectedRegion.label}: {selectedRegion.standard.label} from {formatPrice(selectedRegion.standard.amount)}, or {selectedRegion.express.label} from {formatPrice(selectedRegion.express.amount)} — exact option chosen at checkout.
            </p>
            {selectedRegion.customsNotice && (
              <p style={{
                fontSize: 13, color: "var(--gold-light)", margin: "10px 0 0", padding: 12,
                background: "var(--bg-panel)", border: "1px solid var(--line)", borderRadius: 6,
              }}>
                Shipping outside the UK: your country may charge import duties, taxes, or customs
                handling fees on arrival. These aren't included in your order total and are your
                responsibility to pay — they're set by your country, not by us.
              </p>
            )}
          </div>

          {error && (
            <p style={{ color: "#E08A7D", fontSize: 14, marginBottom: 16 }}>{error}</p>
          )}

          <button className="btn btn-primary" onClick={handleCheckout} disabled={checkingOut}>
            {checkingOut ? "Redirecting to checkout…" : "Checkout with Stripe"}
          </button>

          <div style={{ marginTop: 18 }}>
            <PaymentBadges linkToCart={false} />
            <p style={{ color: "var(--grey-dim)", fontSize: 12, margin: "10px 0 0" }}>
              We never see or store your card details.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
