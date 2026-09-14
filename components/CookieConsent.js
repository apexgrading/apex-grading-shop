"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "apex-cookie-consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      // localStorage unavailable (e.g. private browsing edge cases) — just skip the banner.
    }
  }, []);

  function respond(choice) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ choice, at: new Date().toISOString() }));
    } catch {}
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie notice"
      style={{
        position: "fixed", left: 16, right: 16, bottom: 16, zIndex: 90,
        maxWidth: 640, margin: "0 auto",
        background: "var(--bg-panel)", border: "1px solid var(--line-strong)", borderRadius: 10,
        padding: "20px 22px", boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
      }}
    >
      <h2 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 8px" }}>This site uses cookies</h2>
      <p style={{ fontSize: 13.5, color: "var(--grey)", lineHeight: 1.6, margin: "0 0 16px" }}>
        We only use strictly necessary cookies — to keep you signed in and remember your cart.
        We don't currently use analytics, advertising, or tracking cookies. See our{" "}
        <a href="/privacy" style={{ color: "var(--gold-light)" }}>Privacy Policy</a> for details.
      </p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={() => respond("accepted")} className="btn btn-primary" style={{ flex: 1 }}>
          Accept
        </button>
        <button onClick={() => respond("declined")} className="btn btn-secondary" style={{ flex: 1 }}>
          Decline non-essential
        </button>
      </div>
    </div>
  );
}
