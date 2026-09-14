import Link from "next/link";
import { getCachedPokemonSet, cachePokemonSet } from "../../../lib/data";

export const dynamic = "force-dynamic";

const apiHeaders = process.env.POKEMONTCG_API_KEY
  ? { "X-Api-Key": process.env.POKEMONTCG_API_KEY }
  : {};

async function fetchFromApiAndCache(name) {
  const setRes = await fetch(
    `https://api.pokemontcg.io/v2/sets?q=${encodeURIComponent(`name:"${name}"`)}`,
    { headers: apiHeaders }
  );
  if (setRes.status === 429) return { rateLimited: true };
  if (!setRes.ok) return null;
  const setJson = await setRes.json();
  const set = setJson.data?.[0];
  if (!set) return null;

  const cardsRes = await fetch(
    `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(`set.id:${set.id}`)}&pageSize=250&orderBy=number`,
    { headers: apiHeaders }
  );
  if (cardsRes.status === 429) return { rateLimited: true };
  if (!cardsRes.ok) return null;
  const cardsJson = await cardsRes.json();
  const cards = (cardsJson.data || []).map((c) => ({
    number: c.number,
    name: c.name,
    rarity: c.rarity,
    imageSmall: c.images?.small,
  }));

  const meta = {
    apiSetId: set.id,
    logoUrl: set.images?.logo,
    releaseDate: set.releaseDate,
    total: set.total,
    standardLegal: set.legalities?.standard === "Legal",
  };

  // Cache it for every future request — failures here shouldn't block showing
  // the page to the person who triggered this first fetch.
  try {
    await cachePokemonSet(name, meta, cards);
  } catch (err) {
    console.error("Failed to cache Pokémon set checklist:", err.message);
  }

  return { name, ...meta, cards };
}

export default async function PokemonSetDetailPage({ params }) {
  const name = decodeURIComponent(params.name);

  let set = await getCachedPokemonSet(name);
  let rateLimited = false;

  if (!set) {
    const fetched = await fetchFromApiAndCache(name);
    if (fetched?.rateLimited) rateLimited = true;
    else set = fetched;
  }

  if (!set) {
    return (
      <div>
        <div className="page-head">
          <div className="wrap">
            <div className="crumb">
              <Link href="/">Home</Link> / <Link href="/pokemon-sets">Pokémon Sets</Link> / {name}
            </div>
            <h1>{name}</h1>
          </div>
        </div>
        <div className="wrap" style={{ padding: "40px 0 100px" }}>
          <div className="empty-state">
            <h3>{rateLimited ? "Too many requests — try again in a moment" : "Checklist not available yet"}</h3>
            <p>
              {rateLimited
                ? "Our card database is briefly rate-limited. Wait a few seconds and refresh this page — once it loads once, it's cached permanently and this won't happen again for this set."
                : <>{name} is a genuine set — our card database just hasn't caught up with it yet.</>}{" "}
              Or search our{" "}
              <Link href={`/shop?search=${encodeURIComponent(name)}`} style={{ color: "var(--gold-light)" }}>
                live catalog
              </Link>{" "}
              directly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const cards = set.cards;

  return (
    <div>
      <div className="page-head">
        <div className="wrap">
          <div className="crumb">
            <Link href="/">Home</Link> / <Link href="/pokemon-sets">Pokémon Sets</Link> / {set.name}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 4 }}>
            {set.logoUrl && (
              <img src={set.logoUrl} alt="" style={{ height: 44, width: "auto" }} />
            )}
            <div>
              <h1 style={{ margin: 0 }}>{set.name}</h1>
              <p style={{ margin: "4px 0 0" }}>
                {set.releaseDate} · {set.total} cards
                {set.standardLegal && " · Standard-legal"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="wrap" style={{ padding: "36px 0 100px" }}>
        <p style={{ color: "var(--grey-dim)", fontSize: 13, marginBottom: 24 }}>
          Full checklist, cached for fast loading — not all of these are necessarily in stock. Search our{" "}
          <Link href={`/shop?search=${encodeURIComponent(set.name)}`} style={{ color: "var(--gold-light)" }}>
            live catalog
          </Link>{" "}
          for graded copies we currently have.
        </p>

        {cards.length === 0 ? (
          <div className="empty-state">
            <h3>No cards found for this set</h3>
            <p>This set's checklist appears to be empty in the card database.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 18 }}>
            {cards.map((card, i) => (
              <div key={i}>
                {card.imageSmall && (
                  <img
                    src={card.imageSmall}
                    alt={card.name}
                    style={{ width: "100%", borderRadius: 6, marginBottom: 8, border: "1px solid var(--line)" }}
                    loading="lazy"
                  />
                )}
                <div style={{ fontSize: 12.5, color: "var(--white)", fontWeight: 500 }}>{card.name}</div>
                <div style={{ fontSize: 11.5, color: "var(--grey-dim)" }}>
                  #{card.number} · {card.rarity || "—"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
