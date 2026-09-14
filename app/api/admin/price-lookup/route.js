import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isValidAdminSession } from "../../../../lib/data";

async function requireAdmin() {
  const token = cookies().get("apex_admin")?.value;
  return isValidAdminSession(token);
}

const apiHeaders = process.env.POKEMONTCG_API_KEY
  ? { "X-Api-Key": process.env.POKEMONTCG_API_KEY }
  : {};

async function lookupPokemon(rawInput) {
  // Support "Dialga 020/025" or "Dialga 20" as well as plain "Dialga" — parsing out
  // a card number narrows down to the exact printing instead of every card with that name.
  const numberMatch = rawInput.match(/(\d+)\s*(?:\/\s*\d+)?\s*$/);
  const number = numberMatch ? String(parseInt(numberMatch[1], 10)) : null;
  const name = (number ? rawInput.slice(0, numberMatch.index) : rawInput).trim();

  const queryParts = [`name:"${name}"`];
  if (number) queryParts.push(`number:${number}`);

  let res;
  try {
    res = await fetch(
      `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(queryParts.join(" "))}&pageSize=20`,
      { headers: apiHeaders }
    );
  } catch (err) {
    console.error("Pokemon price lookup fetch error:", err.message, err.cause ? `| cause: ${err.cause}` : "");
    return { error: "unreachable" };
  }
  if (res.status === 429) return { error: "rateLimited" };
  if (!res.ok) {
    console.error("Pokemon price lookup failed:", res.status, await res.text().catch(() => ""));
    return { error: "unreachable" };
  }

  const json = await res.json();
  const results = (json.data || []).map((card) => {
    const prices = card.tcgplayer?.prices || {};
    const marketPrices = Object.entries(prices)
      .map(([variant, p]) => ({ variant, market: p.market }))
      .filter((p) => typeof p.market === "number");
    const best = marketPrices.sort((a, b) => b.market - a.market)[0];

    return {
      id: card.id,
      name: card.name,
      set: card.set?.name || "Unknown set",
      setYear: card.set?.releaseDate ? card.set.releaseDate.split("/")[0] : null,
      number: card.number || "—",
      rarity: card.rarity || "Rarity not listed",
      image: card.images?.large || card.images?.small,
      marketPriceUsd: best?.market ?? null,
      priceVariant: best?.variant ?? null,
    };
  });
  return { results };
}

async function lookupMtg(name) {
  const res = await fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(name)}`, {
    headers: { "User-Agent": "ApexCardsAdmin/1.0", Accept: "application/json" },
  });
  if (res.status === 429) return { error: "rateLimited" };
  if (res.status === 404) return { results: [] }; // Scryfall 404s on zero matches, not an error
  if (!res.ok) return { error: "unreachable" };

  const json = await res.json();
  const results = (json.data || []).slice(0, 20).map((card) => {
    const usd = card.prices?.usd ? parseFloat(card.prices.usd) : null;
    const usdFoil = card.prices?.usd_foil ? parseFloat(card.prices.usd_foil) : null;
    const best = usdFoil != null && (usd == null || usdFoil > usd) ? usdFoil : usd;
    const variant = best === usdFoil && usdFoil != null ? "foil" : "nonfoil";

    return {
      id: card.id,
      name: card.name,
      set: card.set_name,
      setYear: card.released_at ? card.released_at.split("-")[0] : null,
      number: card.collector_number,
      rarity: card.rarity,
      image: card.image_uris?.small,
      marketPriceUsd: best,
      priceVariant: best != null ? variant : null,
    };
  });
  return { results };
}

async function lookupYugioh(name) {
  const res = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(name)}`);
  if (res.status === 429) return { error: "rateLimited" };
  if (res.status === 400) return { results: [] }; // YGOPRODeck 400s on zero matches, not an error
  if (!res.ok) return { error: "unreachable" };

  const json = await res.json();
  const results = (json.data || []).slice(0, 20).map((card) => {
    const price = card.card_prices?.[0];
    const usd = price?.tcgplayer_price ? parseFloat(price.tcgplayer_price) : null;

    return {
      id: card.id,
      name: card.name,
      set: card.card_sets?.[0]?.set_name || card.type,
      setYear: null, // release date isn't consistently available per-printing from this API
      number: card.card_sets?.[0]?.set_code || "",
      rarity: card.card_sets?.[0]?.set_rarity || "",
      image: card.card_images?.[0]?.image_url_small,
      marketPriceUsd: usd && usd > 0 ? usd : null,
      priceVariant: null,
    };
  });
  return { results };
}

export async function GET(request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name")?.trim();
  const gameParam = searchParams.get("game");
  const game = gameParam === "mtg" ? "mtg" : gameParam === "yugioh" ? "yugioh" : "pokemon";
  if (!name) {
    return NextResponse.json({ error: "Provide a card name to search." }, { status: 400 });
  }

  const { results, error } =
    game === "mtg" ? await lookupMtg(name) : game === "yugioh" ? await lookupYugioh(name) : await lookupPokemon(name);

  if (error === "rateLimited") {
    return NextResponse.json({ error: "Price database is briefly rate-limited — try again in a moment." }, { status: 429 });
  }
  if (error === "unreachable") {
    return NextResponse.json({ error: "Couldn't reach the price database." }, { status: 502 });
  }

  return NextResponse.json({ results });
}
