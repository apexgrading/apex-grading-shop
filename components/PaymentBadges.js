"use client";

import Link from "next/link";

export default function PaymentBadges({ compact = false, linkToCart = true }) {
  const content = (
    <div style={{ display: "flex", alignItems: "center", gap: compact ? 10 : 14, flexWrap: "wrap" }}>
      {/* Visa */}
      <svg width="38" height="24" viewBox="0 0 38 24" aria-label="Visa">
        <rect width="38" height="24" rx="4" fill="#1A1F71" />
        <text x="19" y="16.5" textAnchor="middle" fontFamily="Arial, sans-serif" fontStyle="italic" fontWeight="700" fontSize="10.5" fill="#fff">VISA</text>
      </svg>

      {/* Mastercard */}
      <svg width="38" height="24" viewBox="0 0 38 24" aria-label="Mastercard">
        <rect width="38" height="24" rx="4" fill="#F5F3EE" />
        <circle cx="16" cy="12" r="6.5" fill="#EB001B" />
        <circle cx="22" cy="12" r="6.5" fill="#F79E1B" fillOpacity="0.95" />
      </svg>

      {/* Amex */}
      <svg width="38" height="24" viewBox="0 0 38 24" aria-label="American Express">
        <rect width="38" height="24" rx="4" fill="#2E77BC" />
        <text x="19" y="16" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="7.5" fill="#fff">AMEX</text>
      </svg>

      {/* Apple Pay — text only, not Apple's protected logo mark */}
      <div style={{
        height: 24, padding: "0 10px", borderRadius: 4, background: "#000",
        display: "flex", alignItems: "center", fontSize: 11.5, fontWeight: 600, color: "#fff", fontFamily: "-apple-system, system-ui, sans-serif",
      }}>
        Apple Pay
      </div>

      <span style={{ fontSize: 12, color: "var(--grey-dim)", marginLeft: compact ? 0 : 4 }}>
        Powered by <strong style={{ color: "var(--grey)" }}>Stripe</strong>
      </span>
    </div>
  );

  if (!linkToCart) return content;

  return (
    <Link href="/cart" aria-label="Go to checkout" style={{ display: "inline-block" }}>
      {content}
    </Link>
  );
}
