"use client";

import Link from "next/link";
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | done | error

  async function handleSubscribe(e) {
    e.preventDefault();
    if (!email.includes("@")) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setStatus("done");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <footer className="site-footer" style={{ textAlign: "left", padding: "56px 0 32px" }}>
      <div className="wrap">
        <div style={{
          display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr 1.2fr", gap: 40,
          paddingBottom: 40, marginBottom: 28, borderBottom: "1px solid var(--line)",
        }}>
          <div>
            <img src="/assets/apex-logo.jpg" alt="Apex Grading" style={{ height: 28, marginBottom: 14 }} />
            <p style={{ color: "var(--grey)", fontSize: 13.5, maxWidth: "32ch", lineHeight: 1.6 }}>
              Independent authentication and grading, with every graded slab sold direct from the source.
            </p>
          </div>

          <div>
            <h5 style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--grey-dim)", marginBottom: 14 }}>Shop</h5>
            <Link href="/shop" style={{ display: "block", fontSize: 14, color: "var(--grey)", marginBottom: 10 }}>All cards</Link>
            <Link href="/cart" style={{ display: "block", fontSize: 14, color: "var(--grey)", marginBottom: 10 }}>Cart</Link>
          </div>

          <div>
            <h5 style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--grey-dim)", marginBottom: 14 }}>Company</h5>
            <a href="https://www.apexgradingcompany.com" target="_blank" rel="noopener noreferrer" style={{ display: "block", fontSize: 14, color: "var(--grey)", marginBottom: 10 }}>Main website ↗</a>
            <Link href="/terms" style={{ display: "block", fontSize: 14, color: "var(--grey)", marginBottom: 10 }}>Terms &amp; conditions</Link>
            <Link href="/privacy" style={{ display: "block", fontSize: 14, color: "var(--grey)", marginBottom: 10 }}>Privacy policy</Link>
          </div>

          <div>
            <h5 style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--grey-dim)", marginBottom: 14 }}>Get notified</h5>
            <p style={{ fontSize: 13, color: "var(--grey)", marginBottom: 12 }}>New Gem-Mint listings, straight to your inbox.</p>
            {status === "done" ? (
              <p style={{ fontSize: 13.5, color: "var(--gold-light)" }}>You're on the list.</p>
            ) : (
              <form onSubmit={handleSubscribe} style={{ display: "flex", gap: 8 }}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  style={{
                    flex: 1, background: "var(--bg-panel)", border: "1px solid var(--line)",
                    borderRadius: 4, padding: "9px 10px", color: "var(--white)", fontSize: 13.5,
                  }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: "9px 16px", fontSize: 13.5 }} disabled={status === "loading"}>
                  {status === "loading" ? "…" : "Join"}
                </button>
              </form>
            )}
            {status === "error" && <p style={{ fontSize: 12.5, color: "#E08A7D", marginTop: 8 }}>Something went wrong — try again.</p>}
          </div>
        </div>

        <p style={{ color: "var(--grey-dim)", fontSize: 13, margin: 0 }}>
          © {new Date().getFullYear()} Apex Grading Company. All cards graded in-house.
        </p>
      </div>
    </footer>
  );
}
