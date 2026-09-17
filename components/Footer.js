"use client";

import Link from "next/link";
import { useState } from "react";
import PaymentBadges from "./PaymentBadges";

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
        <div className="footer-grid" style={{
          display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr 1.2fr", gap: 40,
          paddingBottom: 40, marginBottom: 28, borderBottom: "1px solid var(--line)",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <img src="/assets/apex-icon.jpg" alt="" style={{ height: 28, width: "auto" }} />
              <span style={{ fontFamily: "'Anton', var(--sans)", fontSize: 19, color: "var(--gold)" }}>
                APEX <span style={{ color: "var(--white)" }}>CARDS</span>
              </span>
            </div>
            <p style={{ color: "var(--grey)", fontSize: 13.5, maxWidth: "32ch", lineHeight: 1.6, marginBottom: 14 }}>
              A UK-based marketplace for cards graded in-house by Apex Grading Company. Every
              listing is a unique, authenticated card, sold direct.
            </p>
            <p style={{ color: "var(--grey-dim)", fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>
              <a href="mailto:hello@apexgradingcompany.com" style={{ color: "var(--grey-dim)" }}>hello@apexgradingcompany.com</a>
              <br />
              18 Glen St, Barrhead, Glasgow G78 1QA
            </p>
            <div style={{ display: "flex", gap: 14 }}>
              <a
                href="https://www.instagram.com/shopapexcards/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Apex Cards on Instagram"
                style={{ color: "var(--grey)", display: "inline-flex" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/share/19iVD8fCuP/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Apex Cards on Facebook"
                style={{ color: "var(--grey)", display: "inline-flex" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13.5 21v-7.5h2.5l.4-3H13.5V8.5c0-.9.25-1.5 1.55-1.5H16.5V4.35C16.2 4.3 15.2 4.2 14 4.2c-2.4 0-4 1.45-4 4.1V10.5H7.5v3H10V21h3.5z" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h5 style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--grey-dim)", marginBottom: 14 }}>Shop</h5>
            <Link href="/shop" style={{ display: "block", fontSize: 14, color: "var(--grey)", marginBottom: 10 }}>All cards</Link>
            <Link href="/cart" style={{ display: "block", fontSize: 14, color: "var(--grey)", marginBottom: 10 }}>Cart</Link>
          </div>

          <div>
            <h5 style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--grey-dim)", marginBottom: 14 }}>Company</h5>
            <a href="https://www.apexgradingcompany.com" target="_blank" rel="noopener noreferrer" className="main-site-cta" style={{ marginBottom: 10 }}>
              <img src="/assets/apex-icon.jpg" alt="" />
              Get your cards graded — head over to Apex Grading
            </a>
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

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
          <p style={{ color: "var(--grey-dim)", fontSize: 13, margin: 0 }}>
            © {new Date().getFullYear()} Apex Cards. Cards graded in-house by Apex Grading Company.
          </p>
          <PaymentBadges compact />
        </div>
      </div>
    </footer>
  );
}
