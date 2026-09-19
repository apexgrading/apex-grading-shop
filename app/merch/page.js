"use client";

import { useState } from "react";
import Link from "next/link";

export default function MerchPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | done | error

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.includes("@")) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="wrap" style={{ maxWidth: 560, padding: "100px 0 140px", textAlign: "center" }}>
      <div className="crumb" style={{ textAlign: "left" }}>
        <Link href="/">Home</Link> / Merchandise
      </div>

      <p style={{ color: "var(--gold-light)", fontSize: 13.5, margin: "40px 0 14px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
        Coming soon
      </p>
      <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(30px,3.6vw,44px)", margin: "0 0 18px" }}>
        Apex Cards merchandise
      </h1>
      <p style={{ color: "var(--grey)", fontSize: 15.5, lineHeight: 1.65, maxWidth: "44ch", margin: "0 auto 40px" }}>
        Official Apex Cards gear and card-care supplies are on the way. Drop your email
        and we'll let you know the moment it launches.
      </p>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 20, maxWidth: 640, margin: "0 auto 48px",
      }} className="merch-preview-grid">
        {[
          { img: "/assets/merch-hoodie.jpg", name: "Hoodie", price: "£10" },
          { img: "/assets/merch-cap.jpg", name: "Mesh Cap", price: "£5" },
          { img: "/assets/merch-bucket-hat.jpg", name: "Bucket Hat", price: "£5" },
          { img: "/assets/merch-tshirt.jpg", name: "T-Shirt", price: "£4" },
          { img: "/assets/merch-penny-sleeves.jpg", name: "Penny Sleeves (100)", price: "£2" },
          { img: "/assets/merch-top-loaders.jpg", name: "Top Loaders (25)", price: "£4" },
        ].map((p) => (
          <div key={p.name} style={{ background: "var(--bg-panel)", border: "1px solid var(--line)", borderRadius: 10, overflow: "hidden" }}>
            <img src={p.img} alt={p.name} style={{ width: "100%", aspectRatio: "1", objectFit: "cover", display: "block" }} />
            <div style={{ padding: "10px 10px 12px", textAlign: "left" }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--white)" }}>{p.name}</div>
              <div style={{ fontSize: 12.5, color: "var(--gold-light)" }}>{p.price}</div>
            </div>
          </div>
        ))}
      </div>

      <p style={{ color: "var(--grey-dim)", fontSize: 12.5, margin: "-30px auto 40px", maxWidth: "40ch" }}>
        Prices confirmed — not yet available to purchase. Sign up below and we'll email you the moment they go live.
      </p>

      {status === "done" ? (
        <p style={{ color: "var(--gold-light)", fontSize: 15 }}>You're on the list — we'll email you when it's live.</p>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10, maxWidth: 380, margin: "0 auto" }}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            style={{
              flex: 1, background: "var(--bg-panel)", border: "1px solid var(--line)",
              borderRadius: 4, padding: "11px 14px", color: "var(--white)", fontSize: 14.5,
            }}
          />
          <button type="submit" className="btn btn-primary" disabled={status === "loading"}>
            {status === "loading" ? "…" : "Notify me"}
          </button>
        </form>
      )}
      {status === "error" && <p style={{ color: "#E08A7D", fontSize: 13, marginTop: 12 }}>Something went wrong — try again.</p>}

      <div style={{ marginTop: 56 }}>
        <Link href="/shop" className="btn btn-secondary">Shop graded cards instead</Link>
      </div>
    </div>
  );
}
