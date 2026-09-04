"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Something went wrong.");
        setLoading(false);
        return;
      }
      router.push("/shop");
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="wrap" style={{ maxWidth: 440, padding: "72px 0 100px" }}>
      <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(28px,3vw,36px)", margin: "0 0 8px" }}>
        Sign in
      </h1>
      <p style={{ color: "var(--grey)", fontSize: 14.5, margin: "0 0 32px" }}>
        Welcome back.
      </p>

      <form onSubmit={handleSubmit}>
        <label style={{ display: "block", fontSize: 13.5, color: "var(--grey)", marginBottom: 6 }}>Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <label style={{ display: "block", fontSize: 13.5, color: "var(--grey)", margin: "18px 0 6px" }}>Password</label>
        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ ...inputStyle, paddingRight: 44 }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            style={eyeButtonStyle}
          >
            <EyeIcon open={showPassword} />
          </button>
        </div>

        {error && <p style={{ color: "#E08A7D", fontSize: 13.5, marginTop: 16 }}>{error}</p>}

        <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: 24 }} disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p style={{ fontSize: 13.5, color: "var(--grey)", marginTop: 24 }}>
        New here? <Link href="/signup" style={{ color: "var(--gold-light)" }}>Create an account</Link>
      </p>
    </div>
  );
}

const inputStyle = {
  width: "100%", background: "var(--bg-panel)", border: "1px solid var(--line)",
  borderRadius: 4, padding: "11px 12px", color: "var(--white)", fontSize: 14.5,
};

const eyeButtonStyle = {
  position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
  background: "none", border: "none", cursor: "pointer", color: "var(--grey)",
  padding: 4, display: "flex",
};

function EyeIcon({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a18.6 18.6 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 7 11 7a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
