"use client";

import { useState } from "react";

export default function BuyMysterySlabButton({ cardId, price }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleBuyNow() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardIds: [cardId], region: "uk" }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "That one just sold — refresh and try again.");
        setLoading(false);
        return;
      }
      window.location.href = json.url;
    } catch {
      setError("Couldn't reach checkout. Try again.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button className="btn btn-primary" onClick={handleBuyNow} disabled={loading} style={{ fontSize: 15, padding: "14px 32px" }}>
        {loading ? "Redirecting to checkout…" : `Buy Now — £${(price / 100).toFixed(0)}`}
      </button>
      {error && <p style={{ color: "#E08A7D", fontSize: 12.5, marginTop: 10 }}>{error}</p>}
      <p style={{ fontSize: 11.5, color: "var(--grey-dim)", marginTop: 10 }}>
        UK shipping selected by default — international customers can choose their region via the normal cart instead.
      </p>
    </div>
  );
}
