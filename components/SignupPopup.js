"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "apex-signup-popup-seen";

export default function SignupPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | done | error

  useEffect(() => {
    let seen = true;
    try {
      seen = !!localStorage.getItem(STORAGE_KEY);
    } catch {}
    if (seen) return;

    // Short delay so it doesn't feel instant/jarring the moment the page loads.
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {}
    setVisible(false);
  }

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
      if (res.ok) {
        setStatus("done");
        try {
          localStorage.setItem(STORAGE_KEY, "1");
        } catch {}
        setTimeout(() => setVisible(false), 1800);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (!visible) return null;

  return (
    <div
      onClick={dismiss}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 95,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg-panel)", border: "1px solid var(--line-strong)", borderRadius: 12,
          padding: "36px 32px", maxWidth: 420, width: "100%", textAlign: "center", position: "relative",
          boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
        }}
      >
        <button
          onClick={dismiss}
          aria-label="Close"
          style={{
            position: "absolute", top: 14, right: 14, background: "none", border: "none",
            color: "var(--grey-dim)", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 4,
          }}
        >
          ✕
        </button>

        {status === "done" ? (
          <>
            <p style={{ fontFamily: "var(--serif)", fontSize: 22, color: "var(--gold-light)", margin: "10px 0" }}>You're in.</p>
            <p style={{ color: "var(--grey)", fontSize: 14 }}>Check your inbox — your 5% off code and free gift details are on the way.</p>
          </>
        ) : (
          <>
            <img src="/assets/apex-icon.jpg" alt="" style={{ width: 44, height: "auto", margin: "0 auto 16px", display: "block" }} />
            <p style={{ fontFamily: "var(--serif)", fontSize: 26, fontWeight: 600, margin: "6px 0 4px", color: "var(--gold-light)" }}>
              GET 5% OFF
            </p>
            <p style={{ fontFamily: "var(--serif)", fontSize: 20, fontWeight: 500, margin: "0 0 16px" }}>
              + A FREE GIFT*
            </p>
            <p style={{ color: "var(--grey)", fontSize: 14, lineHeight: 1.6, margin: "0 0 22px" }}>
              Sign up for 5% off your first order, plus a free gift with every order.
            </p>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                style={{
                  background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 4,
                  padding: "11px 14px", color: "var(--white)", fontSize: 14.5, textAlign: "center",
                }}
              />
              <button type="submit" className="btn btn-primary" disabled={status === "loading"}>
                {status === "loading" ? "…" : "CLAIM MY OFFER"}
              </button>
            </form>
            {status === "error" && <p style={{ color: "#E08A7D", fontSize: 12.5, marginTop: 10 }}>Something went wrong — try again.</p>}
            <button onClick={dismiss} style={{ background: "none", border: "none", color: "var(--grey-dim)", fontSize: 12.5, marginTop: 16, cursor: "pointer" }}>
              Maybe later
            </button>
            <p style={{ color: "var(--grey-dim)", fontSize: 10.5, marginTop: 14 }}>*with every order you place.</p>
          </>
        )}
      </div>
    </div>
  );
}
