"use client";

import { useState, useEffect, useCallback } from "react";

function formatPrice(cents) {
  if (cents == null) return "—";
  return `£${(cents / 100).toLocaleString()}`;
}

export default function AdminOrdersPage() {
  const [authed, setAuthed] = useState(null); // null = checking, false = need login, true = in
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(null);
  const [orders, setOrders] = useState(null);

  const loadOrders = useCallback(async () => {
    const res = await fetch("/api/admin/orders");
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    const json = await res.json();
    setOrders(json.orders || []);
    setAuthed(true);
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) loadOrders();
    else {
      const json = await res.json().catch(() => ({}));
      setLoginError(json.error || "Incorrect password.");
    }
  }

  if (authed === null) return null;

  if (!authed) {
    return (
      <div className="wrap" style={{ maxWidth: 400, padding: "100px 0" }}>
        <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 28, marginBottom: 24 }}>Admin</h1>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%", background: "var(--bg-panel)", border: "1px solid var(--line)",
              borderRadius: 4, padding: "11px 12px", color: "var(--white)", fontSize: 14.5, marginBottom: 16,
            }}
          />
          {loginError && <p style={{ color: "#E08A7D", fontSize: 13.5, marginBottom: 12 }}>{loginError}</p>}
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>Enter</button>
        </form>
      </div>
    );
  }

  return (
    <div className="wrap" style={{ maxWidth: 900, padding: "56px 0 100px" }}>
      <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 30, marginBottom: 32 }}>Orders</h1>

      {orders.length === 0 ? (
        <p style={{ color: "var(--grey)" }}>No orders yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {orders.map((order) => (
            <OrderRow key={order.id} order={order} onShipped={loadOrders} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderRow({ order, onShipped }) {
  const [carrier, setCarrier] = useState(order.carrier || "Royal Mail");
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleShip(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/admin/orders/${order.id}/ship`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ carrier, trackingNumber }),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(json.error || "Something went wrong.");
      return;
    }
    onShipped();
  }

  const addr = order.shippingAddress;

  return (
    <div style={{ border: "1px solid var(--line)", borderRadius: 8, padding: 20, background: "var(--bg-panel)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>Order #{order.id}</div>
          <div style={{ fontSize: 13, color: "var(--grey-dim)" }}>{order.email || "no email"}</div>
        </div>
        <span style={{
          fontSize: 11.5, fontWeight: 600, textTransform: "uppercase", padding: "4px 10px", borderRadius: 20,
          background: order.status === "shipped" ? "rgba(212,167,60,0.15)" : order.status === "paid" ? "rgba(245,243,238,0.1)" : "rgba(224,138,125,0.15)",
          color: order.status === "shipped" ? "var(--gold-light)" : order.status === "paid" ? "var(--grey)" : "#E08A7D",
        }}>
          {order.status}
        </span>
      </div>

      <div style={{ fontSize: 13.5, color: "var(--grey)", marginBottom: 14 }}>
        {order.items.map((i) => (
          <div key={i.id} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
            <span>{i.card.title}{i.quantity > 1 ? ` × ${i.quantity}` : ""}</span>
            <span>{formatPrice(i.price * (i.quantity || 1))}</span>
          </div>
        ))}
        {order.shippingCost != null && (
          <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", color: "var(--grey-dim)" }}>
            <span>Shipping</span>
            <span>{formatPrice(order.shippingCost)}</span>
          </div>
        )}
      </div>

      {addr ? (
        <div style={{ fontSize: 13, color: "var(--grey)", marginBottom: 14, lineHeight: 1.6 }}>
          <strong style={{ color: "var(--white)" }}>{order.shippingName}</strong><br />
          {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}<br />
          {addr.city}{addr.state ? `, ${addr.state}` : ""} {addr.postal_code}<br />
          {addr.country}
        </div>
      ) : (
        <p style={{ fontSize: 13, color: "var(--grey-dim)", marginBottom: 14 }}>No shipping address on file.</p>
      )}

      {order.status === "shipped" ? (
        <p style={{ fontSize: 13.5, color: "var(--gold-light)" }}>
          Shipped via {order.carrier} · Tracking: {order.trackingNumber}
        </p>
      ) : order.status === "paid" ? (
        <form onSubmit={handleShip} style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <select value={carrier} onChange={(e) => setCarrier(e.target.value)} style={{ background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 4, padding: "8px 10px", color: "var(--white)", fontSize: 13.5 }}>
            <option>Royal Mail</option>
            <option>DPD</option>
            <option>DHL</option>
            <option>UPS</option>
            <option>FedEx</option>
            <option>Evri (Hermes)</option>
          </select>
          <input
            required
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Tracking number"
            style={{ flex: 1, minWidth: 160, background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 4, padding: "8px 10px", color: "var(--white)", fontSize: 13.5 }}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: "8px 16px", fontSize: 13.5 }} disabled={saving}>
            {saving ? "Saving…" : "Mark shipped"}
          </button>
          {error && <p style={{ color: "#E08A7D", fontSize: 12.5, width: "100%", margin: 0 }}>{error}</p>}
        </form>
      ) : null}
    </div>
  );
}
