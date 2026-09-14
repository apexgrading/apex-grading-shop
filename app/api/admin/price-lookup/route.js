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

export async function GET(request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name")?.trim();
  if (!name) {
    return NextResponse.json({ error: "Provide a card name to search." }, { status: 400 });
  }

  const res = await fetch(
    `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(`name:"${name}"`)}&pageSize=20`,
    { headers: apiHeaders }
  );

  if (res.status === 429) {
    return NextResponse.json({ error: "Price database is briefly rate-limited — try again in a moment." }, { status: 429 });
  }
  if (!res.ok) {
    return NextResponse.json({ error: "Couldn't reach the price database." }, { status: 502 });
  }

  const json = await res.json();
  const results = (json.data || []).map((card) => {
    const prices = card.tcgplayer?.prices || {};
    // Different printings (normal / holofoil / reverse holofoil / 1st edition, etc.)
    // carry separate price groups — flatten to the highest "market" price available,
    // since that's the most representative real transaction price.
    const marketPrices = Object.entries(prices)
      .map(([variant, p]) => ({ variant, market: p.market }))
      .filter((p) => typeof p.market === "number");
    const best = marketPrices.sort((a, b) => b.market - a.market)[0];

    return {
      id: card.id,
      name: card.name,
      set: card.set?.name,
      number: card.number,
      rarity: card.rarity,
      image: card.images?.small,
      marketPriceUsd: best?.market ?? null,
      priceVariant: best?.variant ?? null,
      tcgplayerUrl: card.tcgplayer?.url,
    };
  });

  return NextResponse.json({ results });
}
