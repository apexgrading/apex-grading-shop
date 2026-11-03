"use client";

import Link from "next/link";
import { getBotToken } from "../lib/bot-token";
import { useState } from "react";
import PaymentBadges from "./PaymentBadges";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [msg, setMsg] = useState("");

  async function handleSubscribe(e) {
    e.preventDefault();
    if (!email.includes("@")) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botToken: await getBotToken(), email }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || "");
      setMsg(j.already ? "You're already on the list ✓" : "You're in — check your inbox.");
      setStatus("done");
      setEmail("");
    } catch (err) {
      setMsg((err && err.message) || "Something went wrong — try again.");
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
              <img src="/assets/shop-apex-cards-logo-full.jpg" alt="Shop APEX Cards" style={{ height: 76, width: "auto", mixBlendMode: "lighten" }} />
            </div>
            <p style={{ color: "var(--grey)", fontSize: 13.5, maxWidth: "32ch", lineHeight: 1.6, marginBottom: 14 }}>
              A UK shop for Apex-graded slabs, Gem Mint 10 Mystery Slabs, raw cards, ETBs,
              booster boxes and merch — slabs graded in-house by Apex Grading Company.
            </p>
            <p style={{ color: "var(--grey-dim)", fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>
              <a href="mailto:hello@shopapexcards.com" style={{ color: "var(--grey-dim)" }}>hello@shopapexcards.com</a>
              <br />
              18 Glen St, Barrhead, Glasgow G78 1QA
            </p>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <a
                href="https://www.instagram.com/shopapexcards/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Shop APEX Cards on Instagram"
                style={{ display: "inline-flex" }}
              >
                <svg width="30" height="30" viewBox="0 0 24 24">
                  <defs>
                    <linearGradient id="ig-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FEDA75" />
                      <stop offset="25%" stopColor="#FA7E1E" />
                      <stop offset="50%" stopColor="#D62976" />
                      <stop offset="75%" stopColor="#962FBF" />
                      <stop offset="100%" stopColor="#4F5BD5" />
                    </linearGradient>
                  </defs>
                  <rect x="2" y="2" width="20" height="20" rx="5.5" fill="url(#ig-gradient)" />
                  <circle cx="12" cy="12" r="4.6" fill="none" stroke="#fff" strokeWidth="1.6" />
                  <circle cx="17.4" cy="6.6" r="1.15" fill="#fff" />
                </svg>
              </a>
              {/* Facebook link updated to the stable profile.php?id= format, which should be more reliable than share links. */}
              <a
                href="https://www.facebook.com/profile.php?id=61594206641360"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Shop APEX Cards on Facebook"
                style={{ display: "inline-flex" }}
              >
                <svg width="30" height="30" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5.5" fill="#1877F2" />
                  <path d="M14.5 21v-7.5h2.5l.4-3H14.5V8.5c0-.9.25-1.5 1.55-1.5H17.5V4.35C17.2 4.3 16.2 4.2 15 4.2c-2.4 0-4 1.45-4 4.1V10.5H8.5v3H11V21h3.5z" fill="#fff" />
                </svg>
              </a>
              <a
                href="https://www.tiktok.com/@shopapexcards"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Shop APEX Cards on TikTok"
                style={{ display: "inline-flex" }}
              >
                <svg width="30" height="30" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5.5" fill="#000" />
                  {/* Simplified note glyph, built from basic shapes for reliable rendering */}
                  <circle cx="10" cy="16" r="2.6" fill="none" stroke="#fff" strokeWidth="1.6" />
                  <rect x="11.3" y="5.5" width="1.6" height="10.5" fill="#fff" />
                  <path d="M12.9 5.5c.3 1.7 1.5 3 3.1 3.5v1.9c-1.2-.15-2.3-.6-3.1-1.3" fill="#fff" />
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
            <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--grey-dim)", margin: "4px 0 8px" }}>Follow Apex Grading</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 12px", marginBottom: 12 }}>
              {[{"name": "YouTube", "url": "https://www.youtube.com/@apexgrading", "path": "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"}, {"name": "TikTok", "url": "https://www.tiktok.com/@apexgrading", "path": "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"}, {"name": "Instagram", "url": "https://www.instagram.com/apexgrading", "path": "M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077"}, {"name": "Facebook", "url": "https://www.facebook.com/share/1C3ESK8FNd/", "path": "M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"}, {"name": "X", "url": "https://x.com/apex_grading", "path": "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"}, {"name": "Threads", "url": "https://www.threads.com/@apexgrading", "path": "M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.321.142 1.49.7 2.58 1.761 3.154 3.07.797 1.82.871 4.79-1.548 7.158-1.85 1.81-4.094 2.628-7.277 2.65Zm1.003-11.69c-.242 0-.487.007-.739.021-1.836.103-2.98.946-2.916 2.143.067 1.256 1.452 1.839 2.784 1.767 1.224-.065 2.818-.543 3.086-3.71a10.5 10.5 0 0 0-2.215-.221z"}].map((x) => (
                <a key={x.name} href={x.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "var(--gold)", display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true"><path d={x.path} /></svg>{x.name}
                </a>
              ))}
            </div>
            <Link href="/terms" style={{ display: "block", fontSize: 14, color: "var(--grey)", marginBottom: 10 }}>Terms &amp; conditions</Link>
            <Link href="/privacy" style={{ display: "block", fontSize: 14, color: "var(--grey)", marginBottom: 10 }}>Privacy policy</Link>
          </div>

          <div>
            <h5 style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--grey-dim)", marginBottom: 14 }}>Get notified</h5>
            <p style={{ fontSize: 13, color: "var(--grey)", marginBottom: 12 }}>New Gem-Mint listings, straight to your inbox.</p>
            {status === "done" ? (
              <p style={{ fontSize: 13.5, color: "var(--gold-light)" }}>{msg || "You're on the list."}</p>
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
            {status === "error" && <p style={{ fontSize: 12.5, color: "#E08A7D", marginTop: 8 }}>{msg || "Something went wrong — try again."}</p>}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
          <p style={{ color: "var(--grey-dim)", fontSize: 13, margin: 0 }}>
            © {new Date().getFullYear()} Shop APEX Cards. Cards graded in-house by Apex Grading Company.
          </p>
          <PaymentBadges compact />
        </div>
      </div>
    </footer>
  );
}
