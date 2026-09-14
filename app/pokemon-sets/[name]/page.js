import Link from "next/link";

export const dynamic = "force-dynamic";

const apiHeaders = process.env.POKEMONTCG_API_KEY
  ? { "X-Api-Key": process.env.POKEMONTCG_API_KEY }
  : {};

async function findSet(name) {
  const res = await fetch(
    `https://api.pokemontcg.io/v2/sets?q=${encodeURIComponent(`name:"${name}"`)}`,
    { headers: apiHeaders, next: { revalidate: 3600 } }
  );
  if (res.status === 429) return { rateLimited: true };
  if (!res.ok) return null;
  const json = await res.json();
  return json.data?.[0] || null;
}

async function getCards(setId) {
  const res = await fetch(
    `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(`set.id:${setId}`)}&pageSize=250&orderBy=number`,
    { headers: apiHeaders, next: { revalidate: 3600 } }
  );
  if (!res.ok) return { cards: [], rateLimited: res.status === 429 };
  const json = await res.json();
  return { cards: json.data || [], rateLimited: false };
}

export default async function PokemonSetDetailPage({ params }) {
  const name = decodeURIComponent(params.name);
  const set = await findSet(name);

  if (!set || set.rateLimited) {
    const rateLimited = set?.rateLimited;
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
                ? "Our card database is briefly rate-limited. Wait a few seconds and refresh this page."
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

  const { cards, rateLimited: cardsRateLimited } = await getCards(set.id);

  return (
    <div>
      <div className="page-head">
        <div className="wrap">
          <div className="crumb">
            <Link href="/">Home</Link> / <Link href="/pokemon-sets">Pokémon Sets</Link> / {set.name}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 4 }}>
            {set.images?.logo && (
              <img src={set.images.logo} alt="" style={{ height: 44, width: "auto" }} />
            )}
            <div>
              <h1 style={{ margin: 0 }}>{set.name}</h1>
              <p style={{ margin: "4px 0 0" }}>
                {set.releaseDate} · {set.total} cards
                {set.legalities?.standard === "Legal" && " · Standard-legal"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="wrap" style={{ padding: "36px 0 100px" }}>
        <p style={{ color: "var(--grey-dim)", fontSize: 13, marginBottom: 24 }}>
          Full checklist via the Pokémon TCG API — not all of these are necessarily in stock. Search our{" "}
          <Link href={`/shop?search=${encodeURIComponent(set.name)}`} style={{ color: "var(--gold-light)" }}>
            live catalog
          </Link>{" "}
          for graded copies we currently have.
        </p>

        {cards.length === 0 ? (
          <div className="empty-state">
            <h3>{cardsRateLimited ? "Too many requests — try again in a moment" : "Couldn't load this set's checklist right now"}</h3>
            <p>{cardsRateLimited ? "Wait a few seconds and refresh this page." : "The card database may be temporarily unavailable — try again shortly."}</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 18 }}>
            {cards.map((card) => (
              <div key={card.id}>
                {card.images?.small && (
                  <img
                    src={card.images.small}
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
