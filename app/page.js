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

const steps = [
  { n: "01", title: "Submit Your Cards", desc: "Create an account, tell us what you're sending with a simple submission form." },
  { n: "02", title: "Ship to Us", desc: "Securely package your cards and send them to our UK grading facility." },
  { n: "03", title: "We Grade & Slab", desc: "Every card is authenticated, graded, and sealed in a tamper-proof slab." },
  { n: "04", title: "Receive & Verify", desc: "Get your graded cards back with a QR code. Anyone can verify the cert number online." },
];

const features = [
  { title: "Precision Grading", desc: "Consistent, rigorous standards with detailed sub-grade analysis on every card." },
  { title: "Tamper-Proof Slabs", desc: "Crystal-clear encapsulation designed to protect and showcase your collection." },
  { title: "Cert Database", desc: "Every card gets a unique cert number. Verify grade and authenticity instantly." },
  { title: "Live Tracking", desc: "Follow your submission through every stage from receipt to return delivery." },
];

const faqs = [
  { q: "What trading cards do you grade?", a: "We grade all major TCGs — Pokémon, Yu-Gi-Oh!, One Piece, Magic: The Gathering, sports cards, and more. If it's a trading card, we can grade it." },
  { q: "How does the grading process work?", a: "Submit through our platform, ship your cards to us, and we authenticate, grade, and encapsulate each card in a tamper-proof slab with a unique certification number." },
  { q: "How do I verify a graded card?", a: "Every card gets a unique cert number. Anyone can look it up on our site to confirm the grade, card details, and authenticity." },
  { q: "Where are you based?", a: "We're a UK-based grading company. All grading and encapsulation happens right here in the United Kingdom." },
];

export default async function HomePage() {
  const { cards: featured } = listCards({ sort: "newest", page: 1 });
  featured.length = Math.min(featured.length, 6);

  return (
    <main>
      {/* HERO */}
      <section style={{ padding: "72px 0 0" }}>
        <div
          className="wrap"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center" }}
        >
          <div>
            <p style={{ fontSize: 13.5, color: "var(--gold-light)", marginBottom: 18, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--gold)", display: "inline-block" }} />
              UK-based · Independent grading, done in-house
            </p>
            <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(38px, 4.4vw, 58px)", lineHeight: 1.08, margin: "0 0 26px", maxWidth: "15ch" }}>
              Professional card grading. Sold direct.
            </h1>
            <p style={{ fontSize: 18, lineHeight: 1.6, color: "var(--grey)", maxWidth: "48ch", margin: "0 0 34px" }}>
              Precision grades, tamper-proof slabs, and a certification database you can trust —
              every card here was authenticated and graded by Apex, then listed the moment the
              label was set. Pokémon, sports, and TCG, Gem Mint 10 down to Poor 1.
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

      {/* TRUST STATEMENT */}
      <section className="section" style={{ paddingBottom: 60 }}>
        <div className="wrap" style={{ maxWidth: 780 }}>
          <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(26px,2.6vw,34px)", margin: "0 0 16px", lineHeight: 1.25 }}>
            Grading you can trust. Protection your cards deserve.
          </h2>
          <p style={{ color: "var(--grey)", fontSize: 16, lineHeight: 1.7, margin: 0 }}>
            Every card is authenticated, graded by hand, and sealed in a crystal-clear tamper-proof
            slab with a unique certification number — verifiable online by anyone, anywhere.
            Industry-standard 1–10 grading scale with sub-grades for centering, edges, corners, and
            surface. No shortcuts, no inconsistency.
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section" style={{ background: "var(--bg-panel)", paddingTop: 80, paddingBottom: 80 }}>
        <div className="wrap">
          <div style={{ marginBottom: 44 }}>
            <p style={{ fontSize: 13, color: "var(--gold-light)", marginBottom: 10 }}>How it works</p>
            <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(28px,3vw,38px)", margin: 0 }}>
              From submission to certified slab.
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "var(--line)", border: "1px solid var(--line)" }} className="how-grid">
            {steps.map((s) => (
              <div key={s.n} style={{ background: "var(--bg-panel)", padding: "30px 24px" }}>
                <div style={{ fontFamily: "var(--serif)", fontSize: 30, color: "var(--gold)", marginBottom: 14 }}>{s.n}</div>
                <h3 style={{ fontSize: 16, margin: "0 0 8px", fontWeight: 600 }}>{s.title}</h3>
                <p style={{ fontSize: 13.5, lineHeight: 1.55, color: "var(--grey)", margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY APEX GRADING */}
      <section className="section">
        <div className="wrap">
          <div style={{ marginBottom: 44 }}>
            <p style={{ fontSize: 13, color: "var(--gold-light)", marginBottom: 10 }}>Why Apex Grading</p>
            <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(28px,3vw,38px)", margin: 0 }}>
              The Apex standard.
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 28 }} className="feature-grid">
            {features.map((f) => (
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
      </section>

      {/* GRADE SCALE */}
      <section id="scale" className="section" style={{ background: "var(--bg-panel)" }}>
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

      {/* RECENTLY GRADED */}
      <section className="section">
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

      {/* FAQ */}
      <section className="section" style={{ background: "var(--bg-panel)" }}>
        <div className="wrap" style={{ maxWidth: 820 }}>
          <div style={{ marginBottom: 40 }}>
            <p style={{ fontSize: 13, color: "var(--gold-light)", marginBottom: 10 }}>FAQs</p>
            <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(28px,3vw,38px)", margin: 0 }}>
              Clear answers to common inquiries.
            </h2>
          </div>
          <div style={{ borderTop: "1px solid var(--line)" }}>
            {faqs.map((f) => (
              <details key={f.q} style={{ borderBottom: "1px solid var(--line)", padding: "18px 0" }}>
                <summary style={{ cursor: "pointer", fontSize: 15.5, fontWeight: 500, color: "var(--white)", listStyle: "none" }}>
                  {f.q}
                </summary>
                <p style={{ margin: "12px 0 0", color: "var(--grey)", fontSize: 14.5, lineHeight: 1.65 }}>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
