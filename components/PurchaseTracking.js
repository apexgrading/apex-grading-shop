"use client";

import { useEffect } from "react";

const CONSENT_STORAGE_KEY = "apex-cookie-consent-v2";
const FIRED_KEY_PREFIX = "apex-ga-purchase-fired-";

// Fires a GA4 "purchase" event for a completed order. GA4 marks "purchase" as a
// key event automatically, so once a Google Ads account is linked to this GA4
// property, it can be imported directly as a conversion action (Google Ads ->
// Goals -> Conversions -> Import from Google Analytics) — no separate AW- tag needed.
export default function PurchaseTracking({ orderId, value, currency, items }) {
  useEffect(() => {
    if (!orderId || typeof window === "undefined") return;

    // Same consent check as GoogleAnalytics.js — don't fire for a visitor who
    // declined analytics cookies.
    let consented = false;
    try {
      const stored = JSON.parse(localStorage.getItem(CONSENT_STORAGE_KEY) || "null");
      consented = stored?.choice === "accepted";
    } catch {
      consented = false;
    }
    if (!consented) return;

    // Guard against firing twice for the same order (e.g. a refresh of this page).
    const firedKey = `${FIRED_KEY_PREFIX}${orderId}`;
    try {
      if (sessionStorage.getItem(firedKey)) return;
    } catch {
      // If sessionStorage is unavailable, fall through rather than silently never firing.
    }

    if (typeof window.gtag !== "function") return;

    window.gtag("event", "purchase", {
      transaction_id: String(orderId),
      value,
      currency,
      items,
    });

    try {
      sessionStorage.setItem(firedKey, "1");
    } catch {}
  }, [orderId, value, currency, items]);

  return null;
}
