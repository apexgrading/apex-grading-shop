"use client";

import { useState, useEffect, useCallback } from "react";

function formatPrice(cents) {
  return `£${(cents / 100).toLocaleString()}`;
}

export default function AdminListingsPage() {
  const [authed, setAuthed] = useState(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(null);
  const [data, setData] = useState({ cards: [], total: 0, totalPages: 1, page: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const loadCards = useCallback(async (page = 1, searchTerm = search) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (searchTerm) params.set("search", searchTerm);
    const res = await fetch(`/api/admin/cards?${params.toString()}`);
    if (res.status === 401) {
      setAuthed(false);
      setLoading(false);
      return;
    }
    const json = await res.json();
    setData(json);
    setAuthed(true);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { loadCards(1, ""); }, [loadCards]);

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) loadCards(1, "");
    else {
      const json = await res.json().catch(() => ({}));
      setLoginError(json.error || "Incorrect password.");
    }
  }

  async function handleDelete(id) {
    setDeletingId(id);
    const res = await fetch(`/api/admin/cards/${id}`, { method: "DELETE" });
    if (res.ok) {
      setData((d) => ({ ...d, cards: d.cards.filter((c) => c.id !== id), total: d.total - 1 }));
    }
    setDeletingId(null);
    setConfirmId(null);
  }

  function handleSearch(e) {
    e.preventDefault();
    loadCards(1, search);
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

  return (
    <div className="wrap" style={{ maxWidth: 800, padding: "56px 0 100px" }}>
      <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 30, marginBottom: 8 }}>Manage listings</h1>
      <p style={{ color: "var(--grey)", fontSize: 14, marginBottom: 8 }}>
        {data.total} card{data.total === 1 ? "" : "s"} total. Deleting removes it permanently — order history stays intact.
      </p>
      <p style={{ marginBottom: 28 }}>
        <a href="/admin" style={{ color: "var(--gold-light)", fontSize: 13.5 }}>← Back to upload</a>
      </p>

      <form onSubmit={handleSearch} style={{ marginBottom: 24, display: "flex", gap: 8 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or cert"
          style={{
            flex: 1, background: "var(--bg-panel)", border: "1px solid var(--line)",
            borderRadius: 4, padding: "10px 12px", color: "var(--white)", fontSize: 13.5,
          }}
        />
        <button type="submit" className="btn btn-secondary" style={{ fontSize: 13 }}>Search</button>
      </form>

      {loading ? (
        <p style={{ color: "var(--grey)" }}>Loading…</p>
      ) : data.cards.length === 0 ? (
        <p style={{ color: "var(--grey)" }}>No listings found.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {data.cards.map((card) => (
            <div
              key={card.id}
              style={{
                display: "flex", alignItems: "center", gap: 14, padding: "12px 14px",
                border: "1px solid var(--line)", borderRadius: 8, background: "var(--bg-panel)",
              }}
            >
              {card.imageUrl ? (
                <img src={card.imageUrl} alt="" style={{ width: 40, height: 56, objectFit: "cover", borderRadius: 4, flexShrink: 0 }} />
              ) : (
                <div style={{ width: 40, height: 56, borderRadius: 4, background: "var(--bg)", flexShrink: 0 }} />
              )}

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, color: "var(--white)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {card.title}
                </div>
                <div style={{ fontSize: 12.5, color: "var(--grey-dim)" }}>
                  {card.category} · {card.isGraded ? `Grade ${card.grade}` : card.condition} · {formatPrice(card.price)}
                  {card.sold && <span style={{ color: "var(--gold-light)" }}> · Sold</span>}
                </div>
              </div>

              {confirmId === card.id ? (
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={() => handleDelete(card.id)}
                    disabled={deletingId === card.id}
                    style={{ background: "#E08A7D", color: "#2A0A05", border: "none", borderRadius: 4, padding: "7px 12px", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}
                  >
                    {deletingId === card.id ? "…" : "Confirm delete"}
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
                  onClick={() => setConfirmId(card.id)}
                  style={{ background: "none", border: "1px solid var(--line)", color: "#E08A7D", borderRadius: 4, padding: "7px 12px", fontSize: 12.5, cursor: "pointer", flexShrink: 0 }}
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {data.totalPages > 1 && (
        <div style={{ display: "flex", gap: 8, marginTop: 24, justifyContent: "center" }}>
          <button className="page-btn" disabled={data.page === 1} onClick={() => loadCards(data.page - 1)}>←</button>
          <span style={{ color: "var(--grey)", fontSize: 13.5, padding: "0 8px" }}>Page {data.page} of {data.totalPages}</span>
          <button className="page-btn" disabled={data.page === data.totalPages} onClick={() => loadCards(data.page + 1)}>→</button>
        </div>
      )}
    </div>
  );
}
