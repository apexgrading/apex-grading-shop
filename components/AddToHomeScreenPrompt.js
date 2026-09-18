"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "apex-a2hs-dismissed";

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

export default function AddToHomeScreenPrompt() {
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState("ios"); // ios | android | other

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {}

    if (isStandalone()) return; // Already installed — no need to nag.

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) return; // Desktop visitors don't need this.

    setPlatform(isIOS() ? "ios" : "android");

    const timer = setTimeout(() => setVisible(true), 6000);
    return () => clearTimeout(timer);
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {}
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed", left: 12, right: 78, bottom: 12, zIndex: 85,
        maxWidth: 420, margin: "0 auto",
        background: "var(--bg-panel)", border: "1px solid var(--gold)", borderRadius: 12,
        padding: "16px 18px", boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
        display: "flex", alignItems: "flex-start", gap: 12,
      }}
    >
      <img src="/assets/apex-icon.jpg" alt="" style={{ width: 34, height: "auto", flexShrink: 0, marginTop: 2 }} />
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13.5, fontWeight: 600, color: "var(--white)", margin: "0 0 4px" }}>
          Add Apex Cards to your Home Screen
        </p>
        {platform === "ios" ? (
          <p style={{ fontSize: 12.5, color: "var(--grey)", margin: 0, lineHeight: 1.5 }}>
            Tap the Share icon <span style={{ color: "var(--gold-light)" }}>⬆︎</span> below, then "Add to Home Screen" — quick access, no browser bar.
          </p>
        ) : (
          <p style={{ fontSize: 12.5, color: "var(--grey)", margin: 0, lineHeight: 1.5 }}>
            Tap the menu (⋮) in your browser, then "Add to Home screen" or "Install app" — quick access, no browser bar.
          </p>
        )}
      </div>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        style={{ background: "none", border: "none", color: "var(--grey-dim)", fontSize: 16, cursor: "pointer", padding: 2, flexShrink: 0 }}
      >
        ✕
      </button>
    </div>
  );
}
