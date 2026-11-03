"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

const CONDITIONS = ["Mint", "Near Mint", "Lightly Played", "Moderately Played", "Heavily Played", "Damaged"];
const LANGS = ["English", "Japanese", "Korean", "Chinese", "French", "German", "Italian", "Spanish", "Portuguese"];
const QUEUE_KEY = "apex_quick_add_queue_v1";
const SETTINGS_KEY = "apex_quick_add_settings_v1";

const panel = { background: "var(--bg-panel)", border: "1px solid var(--line)", borderRadius: 8, padding: 18, marginBottom: 20 };
const field = { background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 4, padding: "9px 10px", color: "var(--white)", fontSize: 14 };
const small = { ...field, padding: "6px 8px", fontSize: 13 };
const label = { display: "block", fontSize: 12.5, color: "var(--grey)", marginBottom: 6, fontWeight: 600 };

function suggestPrice(gbp, s) {
  if (gbp == null) return "";
  let v = gbp;
  if (s.round) v = Math.max(0.49, Math.round((v + 0.01) / 0.5) * 0.5 - 0.01);
  v = Math.max(v, Number(s.min) || 0);
  return v.toFixed(2);
}

// Shrink a phone photo to ~1000px JPEG before sending (fast + cheap to read)
function shrink(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 1000 / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      resolve(c.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

let uid = 0;
const keyOf = () => `r${Date.now().toString(36)}${(uid++).toString(36)}`;

export default function QuickAddPage() {
  const [authed, setAuthed] = useState(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(null);

  const [sets, setSets] = useState([]);
  const [photoReady, setPhotoReady] = useState(false);
  const [setQuery, setSetQuery] = useState("");
  const [numbers, setNumbers] = useState("");
  const [mode, setMode] = useState("set");
  const [settings, setSettings] = useState({ round: true, min: "0.50", condition: "Near Mint", language: "English" });
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(null);
  const [note, setNote] = useState(null);
  const [error, setError] = useState(null);

  const checkAuth = useCallback(async () => {
    const res = await fetch("/api/admin/orders");
    setAuthed(res.status !== 401);
  }, []);
  useEffect(() => { checkAuth(); }, [checkAuth]);

  // remember the queue + settings in this browser, so a refresh loses nothing
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    try { const q = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]"); if (Array.isArray(q) && q.length) setRows(q); } catch {}
    try { const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null"); if (s) setSettings((o) => ({ ...o, ...s })); } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => { if (loaded) try { localStorage.setItem(QUEUE_KEY, JSON.stringify(rows)); } catch {} }, [rows, loaded]);
  useEffect(() => { if (loaded) try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch {} }, [settings, loaded]);

  useEffect(() => {
    if (!authed) return;
    fetch("/api/admin/quick-add?action=sets").then((r) => r.json()).then((j) => {
      if (j.sets) setSets(j.sets);
      setPhotoReady(!!j.photoReady);
      if (j.error) setError(j.error);
    }).catch(() => setError("Couldn't load the list of sets."));
  }, [authed]);

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError(null);
    const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    if (res.ok) setAuthed(true);
    else setLoginError((await res.json().catch(() => ({}))).error || "Incorrect password.");
  }

  const setLabel = (s) => `${s.name}${s.code ? ` (${s.code})` : ""} · ${s.series} · ${String(s.releaseDate || "").slice(0, 4)}`;
  const chosenSet = useMemo(() => sets.find((s) => setLabel(s) === setQuery) || sets.find((s) => s.name.toLowerCase() === setQuery.trim().toLowerCase()), [sets, setQuery]);

  const toRow = (r, extra = {}) => ({
    ...r, key: keyOf(), on: true,
    price: suggestPrice(r.marketGbp, settings),
    condition: settings.condition, language: extra.language || settings.language,
    ...extra,
  });

  async function findBySet(e) {
    e.preventDefault();
    setError(null); setNote(null);
    if (!chosenSet) { setError("Pick a set from the list first."); return; }
    if (!numbers.trim()) { setError("Type the card numbers."); return; }
    setBusy("Looking up cards…");
    try {
      const res = await fetch("/api/admin/quick-add", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "lookup", setId: chosenSet.id, entries: numbers }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Lookup failed");
      setRows((old) => [...j.rows.map((r) => toRow(r)), ...old]);
      setNumbers("");
      setNote(`Added ${j.rows.length} card${j.rows.length === 1 ? "" : "s"} from ${chosenSet.name} to the list below.${j.missing.length ? ` Not found in this set: ${j.missing.join(", ")}.` : ""}`);
    } catch (err) { setError(err.message); }
    setBusy(null);
  }

  async function findByPhoto(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    setError(null); setNote(null);
    let ok = 0; const fails = [];
    for (let i = 0; i < files.length; i += 5) {
      setBusy(`Reading photos ${i + 1}–${Math.min(i + 5, files.length)} of ${files.length}…`);
      try {
        const images = await Promise.all(files.slice(i, i + 5).map(shrink));
        const res = await fetch("/api/admin/quick-add", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "identify", images }) });
        const j = await res.json();
        if (!res.ok) throw new Error(j.error || "Photo reading failed");
        const add = [];
        j.results.forEach((r, k) => {
          if (r.row) { add.push(toRow(r.row, { alternatives: r.alternatives || [], language: LANGS.includes(r.language) ? r.language : settings.language, fromPhoto: files[i + k].name })); ok++; }
          else fails.push(`${files[i + k].name}: ${r.error}`);
        });
        setRows((old) => [...add, ...old]);
      } catch (err) { setError(err.message); break; }
    }
    setBusy(null);
    setNote(`Identified ${ok} of ${files.length} photo${files.length === 1 ? "" : "s"} — check each match below.${fails.length ? ` Couldn't read: ${fails.join("; ")}` : ""}`);
  }

  const update = (key, patch) => setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const chooseVariant = (r, v) => {
    const vv = r.variants.find((x) => x.key === v);
    update(r.key, { variant: v, marketGbp: vv?.gbp ?? null, price: suggestPrice(vv?.gbp ?? null, settings) });
  };
  const swapTo = (r, alt) => update(r.key, { ...alt, key: r.key, on: r.on, qty: r.qty, condition: r.condition, language: r.language, alternatives: [r, ...(r.alternatives || []).filter((a) => a.apiId !== alt.apiId)].map(({ alternatives, ...x }) => x), price: suggestPrice(alt.marketGbp, settings) });
  const reprice = () => setRows((rs) => rs.map((r) => ({ ...r, price: suggestPrice(r.marketGbp, settings) })));

  const picked = rows.filter((r) => r.on);
  const pickedUnits = picked.reduce((t, r) => t + (parseInt(r.qty, 10) || 1), 0);
  const pickedValue = picked.reduce((t, r) => t + (parseFloat(r.price) || 0) * (parseInt(r.qty, 10) || 1), 0);
  const unpriced = picked.filter((r) => !(parseFloat(r.price) > 0));

  async function addToShop() {
    setError(null); setNote(null);
    if (!picked.length) return;
    if (unpriced.length) { setError(`${unpriced.length} ticked card${unpriced.length === 1 ? " has" : "s have"} no price — fill it in or untick.`); return; }
    setBusy(`Adding ${picked.length} cards to the shop…`);
    let created = 0, topped = 0; const errs = [];
    for (let i = 0; i < picked.length; i += 50) {
      const batch = picked.slice(i, i + 50).map((r) => ({
        name: r.name, setName: r.setName, number: r.number, printedTotal: r.printedTotal,
        variantLabel: r.variants.find((v) => v.key === r.variant)?.label || "",
        image: r.image, price: parseFloat(r.price), qty: parseInt(r.qty, 10) || 1, condition: r.condition, language: r.language,
      }));
      try {
        const res = await fetch("/api/admin/quick-add", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "add", items: batch }) });
        const j = await res.json();
        if (!res.ok) throw new Error(j.error || "Add failed");
        created += j.created; topped += j.topped; errs.push(...(j.errors || []));
      } catch (err) { errs.push(err.message); break; }
    }
    if (!errs.length) setRows((rs) => rs.filter((r) => !r.on));
    setBusy(null);
    setNote(`Done: ${created} new listing${created === 1 ? "" : "s"}${topped ? `, ${topped} added to the stock of cards already listed` : ""}. They're live on the shop now.`);
    if (errs.length) setError(`Some didn't go through (they're still in the list): ${errs.slice(0, 5).join("; ")}${errs.length > 5 ? "…" : ""}`);
  }

  if (authed === null) return null;
  if (!authed) {
    return (
      <div className="wrap" style={{ maxWidth: 400, padding: "100px 0" }}>
        <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 28, marginBottom: 24 }}>Admin</h1>
        <form onSubmit={handleLogin}>
          <label htmlFor="pw" style={label}>Admin password</label>
          <input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ ...field, width: "100%", marginBottom: 16 }} />
          {loginError && <p style={{ color: "#E08A7D", fontSize: 13.5, marginBottom: 12 }}>{loginError}</p>}
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>Enter</button>
        </form>
      </div>
    );
  }

  return (
    <div className="wrap" style={{ maxWidth: 1100, padding: "48px 0 100px" }}>
      <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 30, marginBottom: 8 }}>Quick add raw cards</h1>
      <p style={{ color: "var(--grey)", fontSize: 14, marginBottom: 8 }}>
        Pokémon singles with the official card picture and a suggested price from TCGplayer, converted to £. Build up a list, check it, then add it all to the shop in one go.
      </p>
      <p style={{ marginBottom: 24 }}>
        <a href="/admin" style={{ color: "var(--gold-light)", fontSize: 13.5 }}>← Back to admin</a>
      </p>

      <div style={{ ...panel, display: "flex", flexWrap: "wrap", gap: 18, alignItems: "flex-end" }}>
        <div>
          <label style={label} htmlFor="qa-cond">Default condition</label>
          <select id="qa-cond" value={settings.condition} onChange={(e) => setSettings({ ...settings, condition: e.target.value })} style={field}>{CONDITIONS.map((c) => <option key={c}>{c}</option>)}</select>
        </div>
        <div>
          <label style={label} htmlFor="qa-lang">Default language</label>
          <select id="qa-lang" value={settings.language} onChange={(e) => setSettings({ ...settings, language: e.target.value })} style={field}>{LANGS.map((c) => <option key={c}>{c}</option>)}</select>
        </div>
        <div>
          <label style={label} htmlFor="qa-min">Minimum price (£)</label>
          <input id="qa-min" type="number" step="0.01" min="0" value={settings.min} onChange={(e) => setSettings({ ...settings, min: e.target.value })} style={{ ...field, width: 100 }} />
        </div>
        <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 14, paddingBottom: 9 }}>
          <input type="checkbox" checked={settings.round} onChange={(e) => setSettings({ ...settings, round: e.target.checked })} /> Round to the nearest 49p / 99p
        </label>
        {rows.length > 0 && <button type="button" className="btn btn-secondary" style={{ fontSize: 13 }} onClick={reprice}>Re-price the list with these settings</button>}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button type="button" className={`btn ${mode === "set" ? "btn-primary" : "btn-secondary"}`} style={{ fontSize: 13.5 }} onClick={() => setMode("set")}>By set &amp; number</button>
        <button type="button" className={`btn ${mode === "photo" ? "btn-primary" : "btn-secondary"}`} style={{ fontSize: 13.5 }} onClick={() => setMode("photo")}>By photo</button>
      </div>

      {mode === "set" ? (
        <form onSubmit={findBySet} style={panel}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            <div>
              <label style={label} htmlFor="qa-set">Set</label>
              <input id="qa-set" list="qa-sets" value={setQuery} onChange={(e) => setSetQuery(e.target.value)} placeholder={sets.length ? "Start typing, e.g. Obsidian Flames" : "Loading sets…"} style={{ ...field, width: "100%" }} />
              <datalist id="qa-sets">{sets.map((s) => <option key={s.id} value={setLabel(s)} />)}</datalist>
              {chosenSet && <div style={{ fontSize: 12.5, color: "var(--grey-dim)", marginTop: 6 }}>{chosenSet.printedTotal} cards (+ {Math.max(0, chosenSet.total - chosenSet.printedTotal)} secret) · released {chosenSet.releaseDate}</div>}
            </div>
            <div>
              <label style={label} htmlFor="qa-nums">Card numbers</label>
              <textarea id="qa-nums" rows={3} value={numbers} onChange={(e) => setNumbers(e.target.value)} placeholder="125, 126 x3, 199, 4-10, TG05" style={{ ...field, width: "100%", resize: "vertical", fontFamily: "inherit" }} />
              <div style={{ fontSize: 12.5, color: "var(--grey-dim)", marginTop: 6 }}>Separate with commas or new lines. “x3” = three copies. “4-10” = a run.</div>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: 14 }} disabled={!!busy}>Find cards</button>
        </form>
      ) : (
        <div style={panel}>
          {photoReady ? (
            <>
              <label style={label} htmlFor="qa-photos">Photos of cards (one card per photo)</label>
              <input id="qa-photos" type="file" accept="image/*" multiple onChange={findByPhoto} disabled={!!busy} style={{ fontSize: 14 }} />
              <p style={{ fontSize: 12.5, color: "var(--grey-dim)", marginTop: 8, lineHeight: 1.6 }}>Take a straight-on photo with the name and number readable. You can pick many at once. Each match shows the official picture — check it's the right printing before adding. Roughly 1–2p per photo.</p>
            </>
          ) : (
            <p style={{ fontSize: 14, color: "var(--grey)", lineHeight: 1.6, margin: 0 }}>Photo reading needs an AI key on the shop. In Vercel → <b>apex-shop</b> → Settings → Environment Variables, add <code style={{ color: "var(--gold-light)" }}>ANTHROPIC_API_KEY</code> (Production, Sensitive), then redeploy. Until then, use <b>By set &amp; number</b>.</p>
          )}
        </div>
      )}

      {busy && <p style={{ color: "var(--gold-light)", fontSize: 14 }} role="status">{busy}</p>}
      {note && <p style={{ color: "#7FD1A5", fontSize: 14, lineHeight: 1.6 }} role="status">{note}</p>}
      {error && <p style={{ color: "#E08A7D", fontSize: 14, lineHeight: 1.6 }} role="alert">{error}</p>}

      {rows.length > 0 && (
        <div style={{ ...panel, padding: 0, overflow: "hidden" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid var(--line)" }}>
            <div style={{ fontSize: 14 }}><b>{picked.length}</b> of {rows.length} ticked · {pickedUnits} cards · £{pickedValue.toFixed(2)} total</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="button" className="btn btn-secondary" style={{ fontSize: 13 }} onClick={() => setRows((rs) => rs.map((r) => ({ ...r, on: !rs.every((x) => x.on) })))}>Tick / untick all</button>
              <button type="button" className="btn btn-secondary" style={{ fontSize: 13 }} onClick={() => setRows((rs) => rs.filter((r) => r.on))}>Remove unticked</button>
              <button type="button" className="btn btn-primary" style={{ fontSize: 13.5 }} onClick={addToShop} disabled={!!busy || !picked.length}>Add {picked.length} to shop</button>
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, minWidth: 900 }}>
              <thead>
                <tr style={{ textAlign: "left", color: "var(--grey)", fontSize: 12 }}>
                  <th style={{ padding: "10px 12px" }}><span className="sr-only">Add</span></th>
                  <th style={{ padding: "10px 6px" }}>Card</th>
                  <th style={{ padding: "10px 6px" }}>Printing</th>
                  <th style={{ padding: "10px 6px" }}>Market (£)</th>
                  <th style={{ padding: "10px 6px" }}>Your price (£)</th>
                  <th style={{ padding: "10px 6px" }}>Qty</th>
                  <th style={{ padding: "10px 6px" }}>Condition</th>
                  <th style={{ padding: "10px 6px" }}>Language</th>
                  <th style={{ padding: "10px 12px" }}><span className="sr-only">Remove</span></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.key} style={{ borderTop: "1px solid var(--line)", opacity: r.on ? 1 : 0.5, verticalAlign: "top" }}>
                    <td style={{ padding: "10px 12px" }}><input type="checkbox" aria-label={`Add ${r.name}`} checked={r.on} onChange={(e) => update(r.key, { on: e.target.checked })} /></td>
                    <td style={{ padding: "8px 6px" }}>
                      <div style={{ display: "flex", gap: 10 }}>
                        {r.imageSmall ? <img src={r.imageSmall} alt="" style={{ width: 52, borderRadius: 4, flexShrink: 0 }} /> : <div style={{ width: 52, height: 72, background: "var(--bg)", borderRadius: 4 }} />}
                        <div>
                          <div style={{ fontWeight: 600 }}>{r.name}</div>
                          <div style={{ color: "var(--grey)", fontSize: 12.5 }}>{r.setName} · {r.number}{r.printedTotal ? `/${r.printedTotal}` : ""}</div>
                          <div style={{ color: "var(--grey-dim)", fontSize: 12 }}>{r.rarity}</div>
                          {r.fromPhoto && <div style={{ color: "var(--grey-dim)", fontSize: 11.5 }}>from {r.fromPhoto}</div>}
                          {r.alternatives && r.alternatives.length > 0 && (
                            <select aria-label="Wrong card? Pick another match" value="" onChange={(e) => { const alt = r.alternatives.find((a) => a.apiId === e.target.value); if (alt) swapTo(r, alt); }} style={{ ...small, marginTop: 6, maxWidth: 230 }}>
                              <option value="">Wrong card? Other matches…</option>
                              {r.alternatives.map((a) => <option key={a.apiId} value={a.apiId}>{a.name} · {a.setName} {a.number}</option>)}
                            </select>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "8px 6px" }}>
                      {r.variants.length ? (
                        <select aria-label="Printing" value={r.variant || ""} onChange={(e) => chooseVariant(r, e.target.value)} style={small}>
                          {r.variants.map((v) => <option key={v.key} value={v.key}>{v.label}</option>)}
                        </select>
                      ) : <span style={{ color: "var(--grey-dim)" }}>—</span>}
                    </td>
                    <td style={{ padding: "8px 6px", color: "var(--grey)" }}>
                      {r.marketGbp != null ? `£${r.marketGbp.toFixed(2)}` : <span title="No TCGplayer price — set your own">no price</span>}
                      {r.tcgplayerUrl && <div><a href={r.tcgplayerUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--gold-light)", fontSize: 12 }}>TCGplayer ↗</a></div>}
                    </td>
                    <td style={{ padding: "8px 6px" }}><input aria-label="Your price in pounds" type="number" step="0.01" min="0" value={r.price} onChange={(e) => update(r.key, { price: e.target.value })} style={{ ...small, width: 84, borderColor: parseFloat(r.price) > 0 ? "var(--line)" : "#E08A7D" }} /></td>
                    <td style={{ padding: "8px 6px" }}><input aria-label="Quantity" type="number" min="1" max="999" value={r.qty} onChange={(e) => update(r.key, { qty: e.target.value })} style={{ ...small, width: 60 }} /></td>
                    <td style={{ padding: "8px 6px" }}><select aria-label="Condition" value={r.condition} onChange={(e) => update(r.key, { condition: e.target.value })} style={small}>{CONDITIONS.map((c) => <option key={c}>{c}</option>)}</select></td>
                    <td style={{ padding: "8px 6px" }}><select aria-label="Language" value={r.language} onChange={(e) => update(r.key, { language: e.target.value })} style={small}>{LANGS.map((c) => <option key={c}>{c}</option>)}</select></td>
                    <td style={{ padding: "8px 12px" }}><button type="button" aria-label={`Remove ${r.name}`} onClick={() => setRows((rs) => rs.filter((x) => x.key !== r.key))} style={{ background: "none", border: 0, color: "var(--grey)", cursor: "pointer", fontSize: 18 }}>×</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p style={{ fontSize: 12.5, color: "var(--grey-dim)", lineHeight: 1.6 }}>
        Prices are TCGplayer market prices (US) converted to £ at today's rate — a guide, not a promise. Adding a card that's already listed with the same condition and language adds to its stock instead of making a second listing. Your list is saved in this browser until you add it.
      </p>
    </div>
  );
}
