import { listCards } from "../../lib/data";
import ProductCard from "../../components/ProductCard";

export const metadata = { title: "Gem Mint 10 Mystery Slabs — Apex Cards" };
export const dynamic = "force-dynamic";

export default async function MysterySlabsPage() {
  const { cards } = await listCards({ category: "Mystery Slabs", sort: "newest", page: 1 });

  return (
    <div>
      {/* Hero */}
      <div className="page-head" style={{ textAlign: "center" }}>
        <div className="wrap" style={{ maxWidth: 640 }}>
          <p style={{ color: "var(--gold-light)", fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 12px" }}>
            Guaranteed Gem Mint 10
          </p>
          <h1 style={{ fontSize: "clamp(30px,4vw,42px)" }}>Mystery Slabs</h1>
          <div style={{
            display: "inline-block", background: "rgba(212,167,60,0.12)", border: "1px solid var(--gold)",
            color: "var(--gold-light)", fontSize: 13, fontWeight: 700, letterSpacing: "0.06em",
            padding: "6px 16px", borderRadius: 20, margin: "0 0 18px", textTransform: "uppercase",
          }}>
            Limited to 500 — once they're gone, they're gone
          </div>
          <p style={{ fontSize: 16, lineHeight: 1.6, margin: "0 auto 32px" }}>
            Every slab is a genuine Apex Gem Mint 10 — no exceptions. The card itself, and its era,
            is a surprise. Could be a modern chase card. Could be a piece of vintage history from
            Base Set onward. That's the thrill.
          </p>
          <img
            src="/assets/mystery-pack.png"
            alt="Apex Cards Gem Mint 10 Mystery Pack"
            style={{ maxWidth: 340, width: "100%", borderRadius: 12, boxShadow: "0 30px 70px rgba(0,0,0,0.6)" }}
          />
        </div>
      </div>

      {/* Trust / how it works */}
      <div className="wrap" style={{ padding: "48px 0 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 28 }} className="feature-grid">
          {[
            { title: "Always Gem Mint 10", desc: "Every card in the mystery pool has already been graded a genuine 10 by Apex — nothing lower ever goes in." },
            { title: "Any era, genuinely random", desc: "Pulled from our full graded history — 1999 Base Set through the newest releases. We don't cherry-pick which one you get." },
            { title: "Real value varies, always", desc: "That's what makes it a mystery — some pulls are modest, some are genuinely valuable. We won't pretend otherwise." },
            { title: "Shipped like any order", desc: "Tracked, protected packaging, same as every other Apex Cards purchase — no different treatment for mystery slabs." },
          ].map((f) => (
            <div key={f.title}>
              <div style={{
                width: 40, height: 40, borderRadius: 6, background: "var(--bg-panel)",
                border: "1px solid var(--line-strong)", display: "flex", alignItems: "center",
                justifyContent: "center", marginBottom: 16, color: "var(--gold-light)", fontFamily: "var(--serif)", fontSize: 18,
              }}>A</div>
              <h3 style={{ fontSize: 15.5, margin: "0 0 8px", fontWeight: 600 }}>{f.title}</h3>
              <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--grey)", margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="wrap" style={{ padding: "56px 0 40px", maxWidth: 720 }}>
        <h2 style={{ fontSize: 22, marginBottom: 20 }}>Before you buy</h2>
        <details style={{ marginBottom: 4 }}>
          <summary>Is every slab really a Gem Mint 10?</summary>
          <p>Yes — genuinely, no exceptions. We don't include anything below a 10 in the mystery pool. What varies is which card, which era, and what it's worth — not the grade.</p>
        </details>
        <details style={{ marginBottom: 4 }}>
          <summary>Can I choose the game or era?</summary>
          <p>No — that's the point of a mystery slab. If you want to pick a specific card, browse our regular <a href="/shop" style={{ color: "var(--gold-light)" }}>graded shop</a> instead.</p>
        </details>
        <details style={{ marginBottom: 4 }}>
          <summary>What if I'm not happy with what I get?</summary>
          <p>Our standard <a href="/terms" style={{ color: "var(--gold-light)" }}>returns policy</a> applies the same as any purchase — but please buy a mystery slab knowing the value is genuinely random by design, not because something went wrong.</p>
        </details>
      </div>

      {/* Live listings */}
      <div className="wrap" style={{ padding: "20px 0 100px" }}>
        <h2 style={{ fontSize: 22, marginBottom: 20 }}>Available now</h2>
        {cards.length === 0 ? (
          <div className="empty-state">
            <h3>No mystery slabs in stock right now</h3>
            <p>Check back soon — new ones get added regularly.</p>
          </div>
        ) : (
          <div className="shop-grid">
            {cards.map((card) => (
              <ProductCard key={card.id} card={card} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
