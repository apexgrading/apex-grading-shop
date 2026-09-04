"use client";

import { useState } from "react";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(null);

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) setAuthed(true);
    else {
      const json = await res.json().catch(() => ({}));
      setLoginError(json.error || "Incorrect password.");
    }
  }

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

  return <UploadForm />;
}

function UploadForm() {
  const [form, setForm] = useState({ title: "", category: "Pokémon", grade: "10", cert: "", price: "", imageUrl: "" });
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | saving | done | error
  const [error, setError] = useState(null);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("saving");
    setError(null);

    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    if (file) data.append("image", file);

    const res = await fetch("/api/admin/cards", { method: "POST", body: data });
    const json = await res.json();

    if (!res.ok) {
      setError(json.error || "Something went wrong.");
      setStatus("error");
      return;
    }

    setStatus("done");
    setForm({ title: "", category: "Pokémon", grade: "10", cert: "", price: "", imageUrl: "" });
    setFile(null);
    e.target.reset();
  }

  return (
    <div className="wrap" style={{ maxWidth: 520, padding: "56px 0 100px" }}>
      <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 30, marginBottom: 8 }}>Upload a graded card</h1>
      <p style={{ color: "var(--grey)", fontSize: 14, marginBottom: 32 }}>
        Goes live on the shop the moment you submit — no deploy needed.
      </p>

      <form onSubmit={handleSubmit}>
        <Field label="Title">
          <input required value={form.title} onChange={(e) => update("title", e.target.value)} style={inputStyle} placeholder="Charizard ex — Obsidian Flames #201" />
        </Field>

        <Field label="Category">
          <select value={form.category} onChange={(e) => update("category", e.target.value)} style={inputStyle}>
            <option>Pokémon</option>
            <option>Sports</option>
            <option>TCG</option>
          </select>
        </Field>

        <Field label="Grade (1–10)">
          <input required type="number" min="1" max="10" value={form.grade} onChange={(e) => update("grade", e.target.value)} style={inputStyle} />
        </Field>

        <Field label="Cert number">
          <input required value={form.cert} onChange={(e) => update("cert", e.target.value)} style={inputStyle} placeholder="AGC000042" />
        </Field>

        <Field label="Price (USD)">
          <input required type="number" step="0.01" min="0" value={form.price} onChange={(e) => update("price", e.target.value)} style={inputStyle} placeholder="249.00" />
        </Field>

        <Field label="Photo upload (works when the site runs on persistent storage)">
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} style={{ color: "var(--grey)", fontSize: 13.5 }} />
        </Field>

        <Field label="— or — Image URL (works everywhere, incl. serverless hosts)">
          <input value={form.imageUrl} onChange={(e) => update("imageUrl", e.target.value)} style={inputStyle} placeholder="https://.../card-photo.jpg" />
        </Field>

        {error && <p style={{ color: "#E08A7D", fontSize: 13.5, marginBottom: 12 }}>{error}</p>}
        {status === "done" && <p style={{ color: "var(--gold-light)", fontSize: 13.5, marginBottom: 12 }}>Card added — live on the shop now.</p>}

        <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={status === "saving"}>
          {status === "saving" ? "Uploading…" : "Add to catalog"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontSize: 13.5, color: "var(--grey)", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%", background: "var(--bg-panel)", border: "1px solid var(--line)",
  borderRadius: 4, padding: "11px 12px", color: "var(--white)", fontSize: 14.5,
};
