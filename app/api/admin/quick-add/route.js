// Quick add raw cards (admin only).
// Pokémon singles by set + number, or by photo (AI works out which card it is).
// Card details, official pictures and TCGplayer market prices come from the free
// Pokémon TCG database (pokemontcg.io); USD → GBP with the daily ECB rate (frankfurter).
//
// GET  ?action=sets                         → every English set, newest first
// POST { action: "lookup", setId, entries }  → entries: [{ number, qty }] → rows
// POST { action: "identify", images }        → images: [data URL] → rows (needs ANTHROPIC_API_KEY)
// POST { action: "add", items }              → creates listings, or adds to the quantity of a matching one
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isValidAdminSession, createCard, supabase } from "../../../../lib/data";

export const maxDuration = 60;

const API = "https://api.pokemontcg.io/v2";
const apiHeaders = process.env.POKEMONTCG_API_KEY ? { "X-Api-Key": process.env.POKEMONTCG_API_KEY } : {};
const CONDITIONS = ["Mint", "Near Mint", "Lightly Played", "Moderately Played", "Heavily Played", "Damaged"];

async function requireAdmin() {
  return isValidAdminSession(cookies().get("apex_admin")?.value);
}

async function getJson(url, tries = 2) {
  for (let i = 1; i <= tries; i++) {
    try {
      const r = await fetch(url, { headers: apiHeaders, cache: "no-store" });
      if (r.status === 429) throw Object.assign(new Error("The card database is busy — try again in a minute."), { busy: true });
      if (r.ok) return await r.json();
      if (i === tries) throw new Error(`Card database error ${r.status}`);
    } catch (e) {
      if (e.busy || i === tries) throw e;
    }
  }
}

// ---------- caches (per server instance) ----------
let setsCache = null; // { at, sets }
const setCardsCache = new Map(); // setId → { at, cards }
let fxCache = null; // { at, rate }
const HOUR = 3600e3;

async function allSets() {
  if (setsCache && Date.now() - setsCache.at < 12 * HOUR) return setsCache.sets;
  const j = await getJson(`${API}/sets?orderBy=-releaseDate&pageSize=250&select=id,name,series,printedTotal,total,releaseDate,ptcgoCode`);
  const sets = (j.data || []).map((s) => ({ id: s.id, name: s.name, series: s.series, printedTotal: s.printedTotal, total: s.total, releaseDate: s.releaseDate, code: s.ptcgoCode || null }));
  setsCache = { at: Date.now(), sets };
  return sets;
}

async function setCards(setId) {
  const hit = setCardsCache.get(setId);
  if (hit && Date.now() - hit.at < 6 * HOUR) return hit.cards;
  let page = 1, cards = [];
  for (;;) {
    const j = await getJson(`${API}/cards?q=${encodeURIComponent(`set.id:${setId}`)}&pageSize=250&page=${page}&select=id,name,number,rarity,images,tcgplayer,set`);
    cards = cards.concat(j.data || []);
    if (!j.totalCount || cards.length >= j.totalCount || !(j.data || []).length) break;
    page++;
  }
  setCardsCache.set(setId, { at: Date.now(), cards });
  return cards;
}

async function usdToGbp() {
  if (fxCache && Date.now() - fxCache.at < 6 * HOUR) return fxCache.rate;
  try {
    const r = await fetch("https://api.frankfurter.app/latest?from=USD&to=GBP", { cache: "no-store" });
    const j = await r.json();
    const rate = j?.rates?.GBP;
    if (typeof rate === "number" && rate > 0.4 && rate < 1.2) { fxCache = { at: Date.now(), rate }; return rate; }
  } catch {}
  return fxCache?.rate || 0.78; // fallback if the rate service is down
}

// ---------- pricing ----------
const VARIANT_LABEL = { normal: "Normal", holofoil: "Holo", reverseHolofoil: "Reverse holo", "1stEditionNormal": "1st Edition", "1stEditionHolofoil": "1st Edition holo", unlimitedHolofoil: "Unlimited holo", unlimited: "Unlimited" };

function variantsOf(card, rate) {
  const prices = card.tcgplayer?.prices || {};
  return Object.entries(prices)
    .map(([key, p]) => ({ key, label: VARIANT_LABEL[key] || key, usd: typeof p?.market === "number" ? p.market : (typeof p?.mid === "number" ? p.mid : null) }))
    .filter((v) => v.usd != null)
    .map((v) => ({ ...v, gbp: Math.round(v.usd * rate * 100) / 100 }));
}

function rowFor(card, rate, qty = 1) {
  const variants = variantsOf(card, rate);
  // A plain single is usually the normal printing; holos only have a holo price
  const pick = variants.find((v) => v.key === "normal") || variants.find((v) => v.key === "holofoil") || variants[0] || null;
  const printed = card.set?.printedTotal || card.set?.total;
  return {
    apiId: card.id,
    name: card.name,
    number: card.number,
    printedTotal: printed || null,
    setName: card.set?.name || "",
    series: card.set?.series || "",
    rarity: card.rarity || "",
    image: card.images?.large || card.images?.small || null,
    imageSmall: card.images?.small || card.images?.large || null,
    variants,
    variant: pick?.key || null,
    marketGbp: pick?.gbp ?? null,
    tcgplayerUrl: card.tcgplayer?.url || null,
    qty,
  };
}

// "125, 126 x3, 199×2, 4-6" → [{ number, qty }]
function parseEntries(entries) {
  if (Array.isArray(entries)) return entries;
  const out = [];
  for (const raw of String(entries || "").split(/[,\n;]+/)) {
    const t = raw.trim();
    if (!t) continue;
    const m = t.match(/^([A-Za-z]*\d+[A-Za-z]?)(?:\s*\/\s*\d+)?\s*(?:[x×*]\s*(\d+))?$/i);
    const range = t.match(/^(\d+)\s*-\s*(\d+)$/);
    if (range) {
      const a = +range[1], b = +range[2];
      if (b >= a && b - a <= 300) for (let n = a; n <= b; n++) out.push({ number: String(n), qty: 1 });
      continue;
    }
    if (m) out.push({ number: m[1], qty: Math.max(1, Math.min(99, parseInt(m[2] || "1", 10))) });
    else out.push({ number: t, qty: 1, bad: true });
  }
  return out;
}

const normNum = (n) => String(n || "").trim().toUpperCase().replace(/^0+(?=\d)/, "");

// ---------- photo identification ----------
async function identifyPhoto(dataUrl) {
  const m = String(dataUrl).match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
  if (!m) return { error: "Not a photo" };
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model: process.env.IDENTIFY_MODEL || "claude-haiku-5-5",
      max_tokens: 300,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: m[1], data: m[2] } },
          { type: "text", text: "This is a photo of one Pokémon trading card. Read it and reply with JSON only: {\"name\": card name as printed, \"number\": the collector number before the slash (e.g. \"125\" or \"TG05\"), \"total\": the number after the slash or null, \"set\": the set name if you can tell or null, \"language\": \"English\" or the language printed}. If it is not a Pokémon card, reply {\"name\": null}." },
        ],
      }],
    }),
  });
  if (!r.ok) return { error: `AI error ${r.status}` };
  const j = await r.json();
  const text = (j.content || []).map((c) => c.text || "").join("");
  let info;
  try { info = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1)); } catch { return { error: "Couldn't read the card" }; }
  if (!info?.name) return { error: "Not a Pokémon card" };
  const num = normNum(String(info.number || "").split("/")[0]);
  const q = [`name:"${String(info.name).replace(/"/g, "")}"`];
  if (num) q.push(`number:${num}`);
  const found = await getJson(`${API}/cards?q=${encodeURIComponent(q.join(" "))}&pageSize=20&select=id,name,number,rarity,images,tcgplayer,set`);
  let cands = found.data || [];
  if (info.total) {
    const t = parseInt(info.total, 10);
    const byTotal = cands.filter((c) => c.set?.printedTotal === t || c.set?.total === t);
    if (byTotal.length) cands = byTotal;
  }
  if (info.set) {
    const s = String(info.set).toLowerCase();
    const bySet = cands.filter((c) => (c.set?.name || "").toLowerCase().includes(s) || s.includes((c.set?.name || "").toLowerCase()));
    if (bySet.length) cands = bySet;
  }
  return { info, cands };
}

// ---------- adding to the shop ----------
const titleFor = (it) => `${it.name}-${it.setName} ${it.number}${it.printedTotal ? "/" + it.printedTotal : ""}${it.variantLabel && it.variantLabel !== "Normal" && it.variantLabel !== "Holo" ? " " + it.variantLabel : ""}`;

export async function GET(request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const action = new URL(request.url).searchParams.get("action");
  try {
    if (action === "sets") return NextResponse.json({ sets: await allSets(), photoReady: !!process.env.ANTHROPIC_API_KEY });
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Card database unavailable." }, { status: 502 });
  }
}

export async function POST(request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  try {
    if (body.action === "lookup") {
      const sets = await allSets();
      const set = sets.find((s) => s.id === body.setId);
      if (!set) return NextResponse.json({ error: "Pick a set first." }, { status: 400 });
      const [cards, rate] = await Promise.all([setCards(set.id), usdToGbp()]);
      const byNum = new Map(cards.map((c) => [normNum(c.number), c]));
      const rows = [], missing = [];
      for (const e of parseEntries(body.entries)) {
        const c = !e.bad && byNum.get(normNum(e.number));
        if (c) rows.push(rowFor(c, rate, e.qty));
        else missing.push(e.number);
      }
      return NextResponse.json({ rows, missing, rate });
    }

    if (body.action === "identify") {
      if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: "Photo identification needs ANTHROPIC_API_KEY added in Vercel (apex-shop → Settings → Environment Variables)." }, { status: 400 });
      const images = (body.images || []).slice(0, 10);
      const rate = await usdToGbp();
      const results = [];
      for (const img of images) {
        try {
          const r = await identifyPhoto(img);
          if (r.error) { results.push({ error: r.error }); continue; }
          if (!r.cands.length) { results.push({ error: `Read “${r.info.name} ${r.info.number || ""}” but couldn't find it` }); continue; }
          results.push({ row: rowFor(r.cands[0], rate, 1), alternatives: r.cands.slice(1, 6).map((c) => rowFor(c, rate, 1)), language: r.info.language || "English" });
        } catch (e) {
          results.push({ error: e.message || "Couldn't identify" });
        }
      }
      return NextResponse.json({ results, rate });
    }

    if (body.action === "add") {
      const items = Array.isArray(body.items) ? body.items.slice(0, 300) : [];
      let created = 0, topped = 0;
      const errors = [];
      for (const it of items) {
        const price = Math.round(Number(it.price) * 100);
        const qty = Math.max(1, Math.min(999, parseInt(it.qty, 10) || 1));
        const condition = CONDITIONS.includes(it.condition) ? it.condition : "Near Mint";
        const language = String(it.language || "English").slice(0, 30);
        if (!it.name || !it.setName || !it.number || !(price > 0)) { errors.push(`${it.name || "?"}: missing details or price`); continue; }
        const title = titleFor(it).slice(0, 200);
        // Same card, same condition and language, still for sale → add to its stock
        const { data: same } = await supabase.from("cards").select("id, quantity, initial_quantity, title")
          .eq("is_graded", false).eq("sold", false).eq("condition", condition).eq("language", language).ilike("title", title.replace(/[\\%_]/g, "\\$&")).limit(1);
        if (same && same[0]) {
          const s = same[0];
          const { error } = await supabase.from("cards").update({ quantity: (s.quantity ?? 1) + qty, initial_quantity: (s.initial_quantity ?? 1) + qty }).eq("id", s.id);
          if (error) errors.push(`${title}: ${error.message}`); else topped++;
          continue;
        }
        try {
          await createCard({ title, category: "Pokémon", isGraded: false, condition, price, imageUrl: it.image || null, quantity: qty, setName: it.setName, language });
          created++;
        } catch (e) {
          errors.push(`${title}: ${e.message}`);
        }
      }
      return NextResponse.json({ created, topped, errors });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Something went wrong." }, { status: 502 });
  }
}
