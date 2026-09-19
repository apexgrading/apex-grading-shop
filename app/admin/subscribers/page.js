"use client";

import { useState, useEffect, useCallback } from "react";

export default function AdminSubscribersPage() {
  const [authed, setAuthed] = useState(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [confirmId, setConfirmId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadSubscribers = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/subscribers");
    if (res.status === 401) {
      setAuthed(false);
      setLoading(false);
      return;
    }
    const json = await res.json();
    setSubscribers(json.subscribers || []);
    setAuthed(true);
    setLoading(false);
  }, []);

  useEffect(() => { loadSubscribers(); }, [loadSubscribers]);

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) loadSubscribers();
    else {
      const json = await res.json().catch(() => ({}));
      setLoginError(json.error || "Incorrect password.");
    }
  }

  async function handleDelete(id) {
    setDeletingId(id);
    const res = await fetch(`/api/admin/subscribers/${id}`, { method: "DELETE" });
    if (res.ok) {
      setSubscribers((subs) => subs.filter((s) => s.id !== id));
    }
    setDeletingId(null);
    setConfirmId(null);
  }

  function downloadCsv() {
    const rows = [["Email Address", "First Name", "Last Name"]];
    filtered.forEach((s) => rows.push([s.email, "", ""]));
    const csv = "\uFEFF" + rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `apex-cards-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (authed === null) return null;

  if (!authed) {
    return (
      <div className="wrap" style={{ maxWidth: 400, padding: "100px 0" }}>
        <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 28, marginBottom: 24 }}>Admin</h1>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%", background: "var(--bg-panel)", border: "1px solid var(--line)",
              borderRadius: 4, padding: "11px 12px", color: "var(--white)", fontSize: 14.5, marginBottom: 16,
            }}
          />
          {loginError && <p style={{ color: "#E08A7D", fontSize: 13.5, marginBottom: 12 }}>{loginError}</p>}
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>Enter</button>
        </form>
      </div>
    );
  }

  const filtered = subscribers.filter((s) => s.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="wrap" style={{ maxWidth: 720, padding: "56px 0 100px" }}>
      <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 30, marginBottom: 8 }}>Subscribers</h1>
      <p style={{ color: "var(--grey)", fontSize: 14, marginBottom: 28 }}>
        {subscribers.length} total newsletter signup{subscribers.length === 1 ? "" : "s"}.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by email"
          style={{
            flex: 1, minWidth: 200, background: "var(--bg-panel)", border: "1px solid var(--line)",
            borderRadius: 4, padding: "10px 12px", color: "var(--white)", fontSize: 13.5,
          }}
        />
        <button onClick={downloadCsv} className="btn btn-secondary" style={{ fontSize: 13 }}>
          Download CSV (for Mailchimp)
        </button>
      </div>

      {loading ? (
        <p style={{ color: "var(--grey)" }}>Loading…</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: "var(--grey)" }}>No subscribers found.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((s) => (
            <div
              key={s.id}
              style={{
                display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                border: "1px solid var(--line)", borderRadius: 8, background: "var(--bg-panel)",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, color: "var(--white)" }}>{s.email}</div>
                <div style={{ fontSize: 12, color: "var(--grey-dim)" }}>
                  {new Date(s.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </div>
              </div>

              {confirmId === s.id ? (
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={() => handleDelete(s.id)}
                    disabled={deletingId === s.id}
                    style={{ background: "#E08A7D", color: "#2A0A05", border: "none", borderRadius: 4, padding: "7px 12px", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}
                  >
                    {deletingId === s.id ? "…" : "Confirm"}
                  </button>
                  <button
                    onClick={() => setConfirmId(null)}
                    style={{ background: "none", border: "1px solid var(--line)", color: "var(--grey)", borderRadius: 4, padding: "7px 12px", fontSize: 12.5, cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmId(s.id)}
                  style={{ background: "none", border: "1px solid var(--line)", color: "#E08A7D", borderRadius: 4, padding: "7px 12px", fontSize: 12.5, cursor: "pointer", flexShrink: 0 }}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
