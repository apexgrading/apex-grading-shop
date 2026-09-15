"use client";

import { useState, useCallback, useEffect } from "react";

const TEMPLATE = `title,category,isGraded,grade,cert,condition,price,imageUrl,imageUrlBack,isPreorder,expectedDate
Charizard ex - Obsidian Flames #201,Pokémon,true,10,AGC000050,,249.00,https://example.com/charizard-front.jpg,https://example.com/charizard-back.jpg,false,
Blue-Eyes White Dragon - LOB #1,Yu-Gi-Oh!,false,,,Near Mint,45.00,https://example.com/blueeyes.jpg,,false,
Pitch Black Booster Box,Pokémon,false,,,Sealed,120.00,,,true,Late October 2026
`;

export default function BulkUploadPage() {
  const [authed, setAuthed] = useState(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(null);
  const [csv, setCsv] = useState("");
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const checkAuth = useCallback(async () => {
    const res = await fetch("/api/admin/orders"); // any admin-gated GET works as an auth check
    setAuthed(res.status !== 401);
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth]);

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

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => setCsv(evt.target.result);
    reader.readAsText(file);
  }

  function downloadTemplate() {
    const blob = new Blob([TEMPLATE], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "apex-cards-bulk-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleUpload() {
    if (!csv.trim()) return;
    setUploading(true);
    setError(null);
    setResults(null);
    try {
      const res = await fetch("/api/admin/cards/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Upload failed.");
      } else {
        setResults(json);
      }
    } catch {
      setError("Couldn't reach the server.");
    }
    setUploading(false);
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
    <div className="wrap" style={{ maxWidth: 720, padding: "56px 0 100px" }}>
      <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 30, marginBottom: 8 }}>Bulk upload cards</h1>
      <p style={{ color: "var(--grey)", fontSize: 14, marginBottom: 8 }}>
        Upload many cards at once via CSV. Each row becomes one listing, live immediately.
      </p>
      <p style={{ marginBottom: 28 }}>
        <a href="/admin" style={{ color: "var(--gold-light)", fontSize: 13.5 }}>← Back to single upload</a>
      </p>

      <div style={{ background: "var(--bg-panel)", border: "1px solid var(--line)", borderRadius: 8, padding: 20, marginBottom: 28 }}>
        <div style={{ fontWeight: 600, fontSize: 14.5, marginBottom: 10 }}>CSV format</div>
        <p style={{ fontSize: 13, color: "var(--grey)", lineHeight: 1.6, marginBottom: 14 }}>
          Columns: <code style={{ color: "var(--gold-light)" }}>title, category, isGraded, grade, cert, condition, price, imageUrl, imageUrlBack, isPreorder, expectedDate</code>
        </p>
        <ul style={{ fontSize: 12.5, color: "var(--grey-dim)", lineHeight: 1.8, margin: "0 0 14px", paddingLeft: 18 }}>
          <li><strong>isGraded:</strong> true or false. If true, fill grade + cert; if false, fill condition instead.</li>
          <li><strong>category:</strong> must exactly match one of: Pokémon, Sports, One Piece, Magic: The Gathering, Yu-Gi-Oh!, Gundam, Disney, Marvel, DC, Star Wars</li>
          <li><strong>imageUrl:</strong> a hosted front-photo link (Imgur etc.) — leave blank for a placeholder card back</li>
          <li><strong>imageUrlBack:</strong> optional — a hosted back-photo link. Customers can click the image to flip and see it.</li>
          <li><strong>isPreorder:</strong> true or false, optional. If true, expectedDate is shown to customers.</li>
          <li>Cert numbers must be unique — duplicates (in the file or already on the site) are skipped with an error, not overwritten.</li>
        </ul>
        <button type="button" className="btn btn-secondary" onClick={downloadTemplate} style={{ fontSize: 13 }}>
          Download CSV template
        </button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 13.5, color: "var(--grey)", marginBottom: 8 }}>Upload a CSV file</label>
        <input type="file" accept=".csv,text/csv" onChange={handleFile} style={{ color: "var(--grey)", fontSize: 13.5 }} />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 13.5, color: "var(--grey)", marginBottom: 8 }}>— or paste CSV content directly —</label>
        <textarea
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          rows={10}
          placeholder="title,category,isGraded,grade,cert,condition,price,imageUrl,isPreorder,expectedDate&#10;..."
          style={{
            width: "100%", background: "var(--bg-panel)", border: "1px solid var(--line)",
            borderRadius: 4, padding: "12px", color: "var(--white)", fontSize: 13, fontFamily: "monospace",
            resize: "vertical",
          }}
        />
      </div>

      {error && <p style={{ color: "#E08A7D", fontSize: 13.5, marginBottom: 16 }}>{error}</p>}

      <button type="button" className="btn btn-primary" onClick={handleUpload} disabled={uploading || !csv.trim()}>
        {uploading ? "Uploading…" : "Upload cards"}
      </button>

      {results && (
        <div style={{ marginTop: 32, borderTop: "1px solid var(--line)", paddingTop: 24 }}>
          <p style={{ color: "var(--gold-light)", fontSize: 15, fontWeight: 600, marginBottom: 12 }}>
            {results.created.length} card{results.created.length === 1 ? "" : "s"} added
            {results.errors.length > 0 && `, ${results.errors.length} row${results.errors.length === 1 ? "" : "s"} skipped`}
          </p>

          {results.errors.length > 0 && (
            <div style={{ background: "rgba(224,138,125,0.1)", border: "1px solid rgba(224,138,125,0.3)", borderRadius: 6, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#E08A7D", marginBottom: 8 }}>Skipped rows</div>
              {results.errors.map((e, i) => (
                <div key={i} style={{ fontSize: 12.5, color: "var(--grey)", padding: "4px 0" }}>
                  Line {e.line}: {e.error}
                </div>
              ))}
            </div>
          )}

          {results.created.length > 0 && (
            <div style={{ fontSize: 12.5, color: "var(--grey-dim)" }}>
              {results.created.map((c) => (
                <div key={c.id} style={{ padding: "3px 0" }}>✓ {c.title}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
