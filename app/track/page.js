"use client";

import { useState } from "react";

export default function TrackPage() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setOrder(null);
    setLoading(true);
    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, email }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Something went wrong.");
        setLoading(false);
        return;
      }
      setOrder(json.order);
      setLoading(false);
    } catch {
      setError("Couldn't reach the server. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="wrap" style={{ maxWidth: 480, padding: "72px 0 100px" }}>
      <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(28px,3vw,36px)", margin: "0 0 8px" }}>
        Track your order
      </h1>
      <p style={{ color: "var(--grey)", fontSize: 14.5, margin: "0 0 32px" }}>
        Enter your order number and the email you used at checkout.
      </p>

      <form onSubmit={handleSubmit}>
        <label style={{ display: "block", fontSize: 13.5, color: "var(--grey)", marginBottom: 6 }}>Order number</label>
        <input
          required
          type="number"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          style={inputStyle}
          placeholder="7"
        />

        <label style={{ display: "block", fontSize: 13.5, color: "var(--grey)", margin: "18px 0 6px" }}>Email</label>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        {error && <p style={{ color: "#E08A7D", fontSize: 13.5, marginTop: 16 }}>{error}</p>}

        <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: 24 }} disabled={loading}>
          {loading ? "Looking up…" : "Track order"}
        </button>
      </form>

      {order && (
        <div style={{ marginTop: 32, borderTop: "1px solid var(--line)", paddingTop: 24 }}>
          <div className="spec-row"><span className="k">Order</span><span className="v">#{order.id}</span></div>
          <div className="spec-row">
            <span className="k">Status</span>
            <span className="v" style={{ textTransform: "capitalize" }}>{order.status}</span>
          </div>
          {order.items.map((item, i) => (
            <div className="spec-row" key={i}><span className="k">Item</span><span className="v">{item.title}</span></div>
          ))}
          {order.status === "shipped" ? (
            <>
              <div className="spec-row"><span className="k">Carrier</span><span className="v">{order.carrier}</span></div>
              <div className="spec-row"><span className="k">Tracking</span><span className="v">{order.trackingNumber}</span></div>
              {order.trackingUrl && (
                <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ display: "block", textAlign: "center", marginTop: 16 }}>
                  Track with {order.carrier} →
                </a>
              )}
            </>
          ) : (
            <p style={{ color: "var(--grey)", fontSize: 14, marginTop: 16 }}>
              Your order hasn't shipped yet — we'll email you as soon as it's on its way.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  width: "100%", background: "var(--bg-panel)", border: "1px solid var(--line)",
  borderRadius: 4, padding: "11px 12px", color: "var(--white)", fontSize: 14.5,
};
