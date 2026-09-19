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
  const [form, setForm] = useState({
    title: "", category: "Pokémon", isGraded: "true", grade: "10", cert: "",
    condition: "Near Mint", price: "", quantity: "1", imageUrl: "", imageUrlBack: "", isPreorder: "false", expectedDate: "",
  });
  const [file, setFile] = useState(null);
  const [fileBack, setFileBack] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | saving | done | error
  const [error, setError] = useState(null);
  const [priceSearch, setPriceSearch] = useState("");
  const [priceResults, setPriceResults] = useState(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceError, setPriceError] = useState(null);
  const [zoomedImage, setZoomedImage] = useState(null);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  // Resizes/recompresses an image in the browser before upload, so large phone
  // photos (often 3-10MB+) fit under the serverless function's request body
  // limit. Targets a max dimension and JPEG quality that keeps card photos
  // sharp while landing well under that limit.
  async function compressImage(f, maxDimension = 1600, quality = 0.85) {
    if (!f.type.startsWith("image/")) return f;

    const bitmap = await createImageBitmap(f).catch(() => null);
    if (!bitmap) return f; // Fall back to the original if decoding fails (e.g. unsupported format).

    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (!blob) return f;

    return new File([blob], (f.name || "photo").replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("saving");
    setError(null);

    let compressedFile = null;
    let compressedFileBack = null;

    try {
      if (file) compressedFile = await compressImage(file);
      if (fileBack) compressedFileBack = await compressImage(fileBack);
    } catch (err) {
      setError(`Photo processing failed: ${err.message}`);
      setStatus("error");
      return;
    }

    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    // Photos already uploaded directly to Blob above (bypassing the serverless
    // function's body-size limit) — send the resulting URLs, not raw files.
    if (compressedFile) data.append("image", compressedFile);
    if (compressedFileBack) data.append("imageBack", compressedFileBack);

    let res;
    try {
      res = await fetch("/api/admin/cards", { method: "POST", body: data });
    } catch {
      setError("Couldn't reach the server — check your connection and try again.");
      setStatus("error");
      return;
    }

    let json;
    try {
      json = await res.json();
    } catch {
      setError(`Something went wrong on the server (status ${res.status}) and it didn't return a readable response.`);
      setStatus("error");
      return;
    }

    if (!res.ok) {
      setError(json.error || "Something went wrong.");
      setStatus("error");
      return;
    }

    setStatus("done");
    setForm({
      title: "", category: "Pokémon", isGraded: form.isGraded, grade: "10", cert: "",
      condition: "Near Mint", price: "", quantity: "1", imageUrl: "", imageUrlBack: "", isPreorder: "false", expectedDate: "",
    });
    setFile(null);
    setFileBack(null);
    setPriceResults(null);
    setPriceSearch("");
    e.target.reset();
  }

  async function handlePriceLookup(e) {
    e.preventDefault();
    if (!priceSearch.trim()) return;
    setPriceLoading(true);
    setPriceError(null);
    setPriceResults(null);
    const game = form.category === "Magic: The Gathering" ? "mtg" : form.category === "Yu-Gi-Oh!" ? "yugioh" : "pokemon";
    try {
      const res = await fetch(`/api/admin/price-lookup?name=${encodeURIComponent(priceSearch)}&game=${game}`);
      const json = await res.json();
      if (!res.ok) {
        setPriceError(json.error || "Lookup failed.");
      } else if (json.results.length === 0) {
        setPriceError("No matches found — try a shorter or different name.");
      } else {
        setPriceResults(json.results);
      }
    } catch {
      setPriceError("Couldn't reach the price database.");
    }
    setPriceLoading(false);
  }

  const isGraded = form.isGraded === "true";

  return (
    <div className="wrap" style={{ maxWidth: 520, padding: "56px 0 100px" }}>
      <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 30, marginBottom: 8 }}>Upload a card</h1>
      <p style={{ color: "var(--grey)", fontSize: 14, marginBottom: 12 }}>
        Goes live on the shop the moment you submit — no deploy needed.
      </p>
      <p style={{ marginBottom: 32 }}>
        <a href="/admin/orders" style={{ color: "var(--gold-light)", fontSize: 13.5 }}>View orders & mark shipped →</a>
        {" · "}
        <a href="/admin/bulk" style={{ color: "var(--gold-light)", fontSize: 13.5 }}>Bulk upload via CSV →</a>
        {" · "}
        <a href="/admin/listings" style={{ color: "var(--gold-light)", fontSize: 13.5 }}>Manage / delete listings →</a>
        {" · "}
        <a href="/admin/subscribers" style={{ color: "var(--gold-light)", fontSize: 13.5 }}>Subscribers →</a>
      </p>

      {(form.category === "Pokémon" || form.category === "Magic: The Gathering" || form.category === "Yu-Gi-Oh!") && (
        <div style={{ background: "var(--bg-panel)", border: "1px solid var(--line)", borderRadius: 8, padding: 16, marginBottom: 28 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 10 }}>Check live market price</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={priceSearch}
              onChange={(e) => setPriceSearch(e.target.value)}
              placeholder={form.category === "Magic: The Gathering" ? "e.g. Black Lotus" : form.category === "Yu-Gi-Oh!" ? "e.g. Blue-Eyes White Dragon" : "e.g. Dialga 20/25 (name + number for an exact match)"}
              style={{ ...inputStyle, flex: 1 }}
              onKeyDown={(e) => e.key === "Enter" && handlePriceLookup(e)}
            />
            <button type="button" className="btn btn-secondary" onClick={handlePriceLookup} disabled={priceLoading} style={{ whiteSpace: "nowrap" }}>
              {priceLoading ? "Looking up…" : "Look up"}
            </button>
          </div>
          {priceError && <p style={{ color: "#E08A7D", fontSize: 12.5, marginTop: 10 }}>{priceError}</p>}
          {priceResults && (
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10, maxHeight: 420, overflowY: "auto" }}>
              {priceResults.map((r) => (
                <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12.5, padding: "8px 0", borderBottom: "1px solid var(--line)" }}>
                  {r.image && (
                    <img
                      src={r.image}
                      alt=""
                      onClick={() => setZoomedImage(r.image)}
                      style={{ width: 60, height: 84, borderRadius: 4, objectFit: "cover", flexShrink: 0, cursor: "zoom-in" }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "var(--white)", fontWeight: 500 }}>{r.name}</div>
                    <div style={{ color: "var(--grey)" }}>{r.set}{r.setYear ? ` (${r.setYear})` : ""} · #{r.number}</div>
                    <div style={{ color: "var(--grey-dim)" }}>{r.rarity}{r.priceVariant ? ` · ${r.priceVariant}` : ""}</div>
                  </div>
                  <div style={{ textAlign: "right", color: "var(--gold-light)", fontWeight: 600, fontSize: 14 }}>
                    {r.marketPriceUsd != null ? `$${r.marketPriceUsd.toFixed(2)}` : "no price"}
                  </div>
                </div>
              ))}
            </div>
          )}
          <p style={{ fontSize: 11.5, color: "var(--grey-dim)", marginTop: 10, marginBottom: 0 }}>
            USD market prices from {form.category === "Magic: The Gathering" ? "Scryfall/TCGPlayer" : form.category === "Yu-Gi-Oh!" ? "YGOPRODeck/TCGPlayer" : "TCGPlayer, via the Pokémon TCG database"}. Convert to GBP and set your own price with margin — not auto-filled.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Field label="Listing type">
          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={() => update("isGraded", "true")}
              className={`btn ${isGraded ? "btn-primary" : "btn-secondary"}`}
              style={{ flex: 1 }}
            >
              Graded slab
            </button>
            <button
              type="button"
              onClick={() => update("isGraded", "false")}
              className={`btn ${!isGraded ? "btn-primary" : "btn-secondary"}`}
              style={{ flex: 1 }}
            >
              Raw single
            </button>
          </div>
        </Field>

        <Field label="Title">
          <input required value={form.title} onChange={(e) => update("title", e.target.value)} style={inputStyle} placeholder={isGraded ? "Charizard ex — Obsidian Flames #201" : "Charizard — Obsidian Flames #6"} />
        </Field>

        <Field label="Category">
          <select value={form.category} onChange={(e) => update("category", e.target.value)} style={inputStyle}>
            <option>Pokémon</option>
            <option>Sports</option>
            <option>One Piece</option>
            <option>Magic: The Gathering</option>
            <option>Yu-Gi-Oh!</option>
            <option>Gundam</option>
            <option>Disney</option>
            <option>Marvel</option>
            <option>DC</option>
            <option>Star Wars</option>
            <option>Mystery Slabs</option>
          </select>
        </Field>

        {isGraded ? (
          <>
            <Field label="Grade (1–10)">
              <input required type="number" min="1" max="10" value={form.grade} onChange={(e) => update("grade", e.target.value)} style={inputStyle} />
            </Field>

            <Field label="Cert number">
              <input required value={form.cert} onChange={(e) => update("cert", e.target.value)} style={inputStyle} placeholder="AGC000042" />
            </Field>
          </>
        ) : (
          <Field label="Condition">
            <select value={form.condition} onChange={(e) => update("condition", e.target.value)} style={inputStyle}>
              <option>Near Mint</option>
              <option>Lightly Played</option>
              <option>Moderately Played</option>
              <option>Heavily Played</option>
              <option>Damaged</option>
              <option>Sealed</option>
            </select>
            <p style={{ fontSize: 12, color: "var(--grey-dim)", marginTop: 6 }}>
              Choose "Sealed" for ETBs, booster packs, booster boxes, and other sealed product — this is what makes them show up on the dedicated Sealed Product page.
            </p>
          </Field>
        )}

        <Field label="Price (GBP)">
          <input required type="number" step="0.01" min="0" value={form.price} onChange={(e) => update("price", e.target.value)} style={inputStyle} placeholder="249.00" />
        </Field>

        <Field label="Quantity in stock">
          <input type="number" step="1" min="1" value={form.quantity} onChange={(e) => update("quantity", e.target.value)} style={inputStyle} placeholder="1" />
          <p style={{ fontSize: 12, color: "var(--grey-dim)", marginTop: 6 }}>
            Leave at 1 for a unique item (a single graded card). For sealed product or merch with multiple identical units, enter how many you have — the listing stays live with a lower count as they sell, instead of disappearing after one sale.
          </p>
        </Field>

        <Field label="Availability">
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "var(--grey)", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={form.isPreorder === "true"}
              onChange={(e) => update("isPreorder", e.target.checked ? "true" : "false")}
            />
            This is a pre-order (not yet in hand)
          </label>
          {form.isPreorder === "true" && (
            <input
              value={form.expectedDate}
              onChange={(e) => update("expectedDate", e.target.value)}
              style={{ ...inputStyle, marginTop: 10 }}
              placeholder="Expected date, e.g. 'Late October 2026'"
            />
          )}
        </Field>

        <Field label="Photo upload (front)">
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} style={{ color: "var(--grey)", fontSize: 13.5 }} />
        </Field>

        <Field label="— or — Image URL, front (works everywhere, incl. serverless hosts)">
          <input value={form.imageUrl} onChange={(e) => update("imageUrl", e.target.value)} style={inputStyle} placeholder="https://.../card-photo-front.jpg" />
        </Field>

        <Field label="Photo upload (back) — optional">
          <input type="file" accept="image/*" onChange={(e) => setFileBack(e.target.files?.[0] || null)} style={{ color: "var(--grey)", fontSize: 13.5 }} />
        </Field>

        <Field label="— or — Image URL, back — optional">
          <input value={form.imageUrlBack} onChange={(e) => update("imageUrlBack", e.target.value)} style={inputStyle} placeholder="https://.../card-photo-back.jpg" />
        </Field>

        {error && <p style={{ color: "#E08A7D", fontSize: 13.5, marginBottom: 12 }}>{error}</p>}
        {status === "done" && <p style={{ color: "var(--gold-light)", fontSize: 13.5, marginBottom: 12 }}>Card added — live on the shop now.</p>}

        <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={status === "saving"}>
          {status === "saving" ? "Uploading…" : "Add to catalog"}
        </button>
      </form>

      {zoomedImage && (
        <div
          onClick={() => setZoomedImage(null)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 100,
            display: "flex", alignItems: "center", justifyContent: "center", padding: 24, cursor: "zoom-out",
          }}
        >
          <img src={zoomedImage} alt="" style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: 8 }} />
        </div>
      )}
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
