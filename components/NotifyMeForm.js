"use client";

import { useState } from "react";

export default function NotifyMeForm({ category, cardTitle }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | done | error

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.includes("@")) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/notify-me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, category, cardTitle }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <p style={{ fontSize: 13.5, color: "var(--gold-light)", margin: 0 }}>
        ✓ You're on the list — we'll email you when something similar comes in.
      </p>
    );
  }

  return (
    <div>
      <p style={{ fontSize: 13.5, color: "var(--grey)", margin: "0 0 10px" }}>
        This one's gone, but want us to email you when something similar{category ? ` in ${category}` : ""} comes in?
      </p>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          style={{
            flex: 1, minWidth: 180, background: "var(--bg)", border: "1px solid var(--line)",
            borderRadius: 4, padding: "10px 12px", color: "var(--white)", fontSize: 13.5,
          }}
        />
        <button type="submit" className="btn btn-secondary" style={{ fontSize: 13 }} disabled={status === "loading"}>
          {status === "loading" ? "…" : "Notify me"}
        </button>
      </form>
      {status === "error" && <p style={{ color: "#E08A7D", fontSize: 12, marginTop: 8 }}>Something went wrong — try again.</p>}
    </div>
  );
}
