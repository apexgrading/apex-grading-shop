import Link from "next/link";
import { POKEMON_ERAS } from "../../lib/pokemon-sets";

export const metadata = { title: "Pokémon TCG Sets — Apex Cards" };

export default function PokemonSetsPage() {
  const totalSets = POKEMON_ERAS.reduce((sum, e) => sum + e.sets.length, 0);

  return (
    <div>
      <div className="page-head">
        <div className="wrap">
          <div className="crumb"><Link href="/">Home</Link> / <Link href="/shop">Shop</Link> / Pokémon Sets</div>
          <h1>Pokémon TCG sets, 1999–2026</h1>
          <p>{totalSets} main sets across {POKEMON_ERAS.length} eras, from Base Set to today. Tap a set name to search our catalog for cards from it.</p>
        </div>
      </div>

      <div className="wrap" style={{ padding: "40px 0 100px" }}>
        {POKEMON_ERAS.map((era) => (
          <div key={era.era} style={{ marginBottom: 44 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16, borderBottom: "1px solid var(--line)", paddingBottom: 10 }}>
              <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 22, margin: 0, color: "var(--gold-light)" }}>{era.era}</h2>
              <span style={{ fontSize: 13, color: "var(--grey-dim)" }}>{era.years}</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {era.sets.map((set) => (
                <Link
                  key={set}
                  href={`/shop?search=${encodeURIComponent(set)}`}
                  style={{
                    fontSize: 13.5, padding: "8px 14px", border: "1px solid var(--line)",
                    borderRadius: 20, color: "var(--grey)", transition: "border-color .15s, color .15s",
                  }}
                  className="set-chip"
                >
                  {set}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
