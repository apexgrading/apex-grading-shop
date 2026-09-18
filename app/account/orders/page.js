"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

function formatPrice(cents) {
  if (cents == null) return "—";
  return `£${(cents / 100).toLocaleString()}`;
}

export default function MyOrdersPage() {
  const [status, setStatus] = useState("loading"); // loading | signed-out | ready
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/orders/mine")
      .then(async (res) => {
        if (res.status === 401) {
          setStatus("signed-out");
          return;
        }
        const json = await res.json();
        if (!res.ok) {
          setError(json.error || "Something went wrong.");
        } else {
          setOrders(json.orders);
        }
        setStatus("ready");
      })
      .catch(() => {
        setError("Couldn't reach the server.");
        setStatus("ready");
      });
  }, []);

  if (status === "loading") return null;

  if (status === "signed-out") {
    return (
      <div className="wrap" style={{ maxWidth: 480, padding: "100px 0", textAlign: "center" }}>
        <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 28, marginBottom: 12 }}>My Orders</h1>
        <p style={{ color: "var(--grey)", fontSize: 14.5, marginBottom: 24 }}>
          Sign in to see your order history.
        </p>
        <Link href="/signin" className="btn btn-primary">Sign in</Link>
      </div>
    );
  }

  return (
    <div className="wrap" style={{ maxWidth: 720, padding: "56px 0 100px" }}>
      <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 30, marginBottom: 8 }}>My Orders</h1>
      <p style={{ color: "var(--grey)", fontSize: 14, marginBottom: 32 }}>
        Every order placed under this account's email address.
      </p>

      {error && <p style={{ color: "#E08A7D", fontSize: 14 }}>{error}</p>}

      {!error && orders.length === 0 ? (
        <div className="empty-state">
          <h3>No orders yet</h3>
          <p>Once you place an order, it'll show up here.</p>
          <Link href="/shop" className="btn btn-primary">Shop graded cards</Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {orders.map((order) => (
            <div key={order.id} style={{ border: "1px solid var(--line)", borderRadius: 8, padding: 20, background: "var(--bg-panel)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>Order #{order.id}</div>
                  <div style={{ fontSize: 12.5, color: "var(--grey-dim)" }}>
                    {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  </div>
                </div>
                <span style={{
                  fontSize: 11.5, fontWeight: 600, textTransform: "uppercase", padding: "4px 10px", borderRadius: 20,
                  background: order.status === "shipped" ? "rgba(212,167,60,0.15)" : "rgba(245,243,238,0.1)",
                  color: order.status === "shipped" ? "var(--gold-light)" : "var(--grey)",
                }}>
                  {order.status}
                </span>
              </div>

              <div style={{ fontSize: 13.5, color: "var(--grey)", marginBottom: 14 }}>
                {order.items.map((i) => (
                  <div key={i.id} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
                    <span>{i.card.title}</span>
                    <span>{formatPrice(i.price)}</span>
                  </div>
                ))}
              </div>

              {order.status === "shipped" ? (
                <p style={{ fontSize: 13.5, color: "var(--gold-light)", margin: 0 }}>
                  Shipped via {order.carrier} · Tracking: {order.trackingNumber}
                  {order.trackingUrl && (
                    <>
                      {" · "}
                      <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--gold-light)", textDecoration: "underline" }}>
                        Track →
                      </a>
                    </>
                  )}
                </p>
              ) : (
                <p style={{ fontSize: 13, color: "var(--grey-dim)", margin: 0 }}>
                  Not shipped yet — we'll email you once it's on its way.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
