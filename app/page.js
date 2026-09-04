import Link from "next/link";
import { listCards } from "../lib/data";
import ProductCard from "../components/ProductCard";

const scale = [
  { n: 10, name: "Gem Mint", desc: "Flawless to the eye under magnification", w: 100 },
  { n: 9, name: "Mint", desc: "One minor, well-placed flaw at most", w: 92 },
  { n: 8, name: "Near Mint–Mint", desc: "Faint wear visible on close inspection", w: 82 },
  { n: 7, name: "Near Mint", desc: "Light surface or corner wear", w: 72 },
  { n: 6, name: "Excellent–Mint", desc: "Visible wear, still sharp overall", w: 62 },
  { n: 5, name: "Excellent", desc: "Moderate wear across corners or edges", w: 52 },
  { n: 4, name: "Very Good–Excellent", desc: "Noticeable handling wear", w: 42 },
  { n: 3, name: "Very Good", desc: "Rounded corners, surface scuffing", w: 32 },
  { n: 2, name: "Good", desc: "Heavy wear, may include minor creasing", w: 22 },
  { n: 1, name: "Poor", desc: "Major damage — creases, tears, or writing", w: 12 },
];

export default async function HomePage() {
  const { cards: featured } = listCards({ sort: "newest", page: 1 });
  featured.length = Math.min(featured.length, 6);

  return (
    <main>
      <section style={{ padding: "72px 0 0" }}>
        <div
          className="wrap"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center" }}
        >
          <div>
            <p style={{ fontSize: 13.5, color: "var(--gold-light)", marginBottom: 18, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--gold)", display: "inline-block" }} />
              Independent grading, done in-house
            </p>
            <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(40px, 4.6vw, 62px)", lineHeight: 1.06, margin: "0 0 26px", maxWidth: "13ch" }}>
              The card. The grade. No middleman.
            </h1>
            <p style={{ fontSize: 18, lineHeight: 1.6, color: "var(--grey)", maxWidth: "46ch", margin: "0 0 34px" }}>
              Apex authenticates and grades every card itself, then lists it for sale the moment the label is set — Pokémon, sports, and TCG, Gem Mint 10 down to Poor 1.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <Link href="/shop" className="btn btn-primary">Shop graded cards</Link>
              <Link href="#scale" className="btn btn-secondary">See the grading scale</Link>
            </div>
          </div>
          <div style={{
            background: "radial-gradient(circle at 30% 20%, rgba(212,167,60,0.14), transparent 55%), var(--bg-panel)",
            border: "1px solid var(--line)", borderRadius: 6, minHeight: 500,
            display: "flex", alignItems: "center", justifyContent: "center", padding: 36,
          }}>
            {featured[0] && (
              <div style={{ width: 260, borderRadius: 8, overflow: "hidden", boxShadow: "0 30px 70px rgba(0,0,0,0.7)" }}>
                {featured[0].imageUrl ? (
                  <img src={featured[0].imageUrl} alt={featured[0].title} style={{ width: "100%" }} />
                ) : (
                  <ProductCard card={featured[0]} />
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="scale" className="section" style={{ background: "var(--bg-panel)", padding: "96px 0", marginTop: 80 }}>
        <div className="wrap">
          <div style={{ marginBottom: 44 }}>
            <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(30px,3vw,40px)", margin: "0 0 14px" }}>The Apex scale</h2>
            <p style={{ color: "var(--grey)", maxWidth: "60ch", fontSize: 15.5, lineHeight: 1.6 }}>
              Every card is graded on the same ten-point scale, checked by two independent graders before it's encapsulated.
            </p>
          </div>
          <div style={{ borderTop: "1px solid var(--line)" }}>
            {scale.map((s) => (
              <div key={s.n} style={{ display: "grid", gridTemplateColumns: "64px 1fr 240px", alignItems: "center", gap: 24, padding: "16px 0", borderBottom: "1px solid var(--line)" }}>
                <div style={{ fontFamily: "var(--serif)", fontSize: 30, color: "var(--gold-light)" }}>{s.n}</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 500 }}>{s.name}</div>
                  <div style={{ height: 5, borderRadius: 3, background: "rgba(245,243,238,0.08)", marginTop: 6 }}>
                    <div style={{ width: `${s.w}%`, height: "100%", borderRadius: 3, background: "var(--gold)" }} />
                  </div>
                </div>
                <div style={{ fontSize: 13.5, color: "var(--grey-dim)", textAlign: "right" }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="section">
        <div className="wrap">
          <div style={{ marginBottom: 44 }}>
            <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(30px,3vw,40px)", margin: "0 0 14px" }}>Recently graded, ready to ship</h2>
            <p style={{ color: "var(--grey)", fontSize: 15.5 }}>Live from the catalog — new listings go up as soon as they're encapsulated.</p>
          </div>
          <div className="shop-grid" style={{ padding: 0 }}>
            {featured.map((card) => (
              <ProductCard key={card.id} card={card} />
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <Link href="/shop" className="btn btn-secondary">View all listings</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
