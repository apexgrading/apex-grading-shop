import { notFound } from "next/navigation";
import Link from "next/link";
import { getCardById } from "../../../lib/data";
import AddToCartButton from "../../../components/AddToCartButton";

function formatPrice(cents) {
  return `$${(cents / 100).toLocaleString()}`;
}

export default async function CardDetailPage({ params }) {
  const id = parseInt(params.id, 10);
  if (Number.isNaN(id)) notFound();

  const card = getCardById(id);
  if (!card) notFound();

  return (
    <div className="wrap">
      <div style={{ padding: "24px 0 0", fontSize: 13, color: "var(--grey-dim)" }}>
        <Link href="/">Home</Link> / <Link href="/shop">Shop</Link> / {card.title}
      </div>

      <div className="detail-grid">
        <div className="detail-stage">
          {card.imageUrl ? (
            <img src={card.imageUrl} alt={card.title} />
          ) : (
            <div style={{ width: 280 }}>
              <div className="slab-shell">
                <div className="slab-label">
                  <div className="slab-grade">{card.grade}</div>
                  <div className="slab-meta">
                    <div className="g1">APEX GRADING</div>
                    <div className="g2">{card.title}</div>
                    <div className="slab-cert">Cert {card.cert}</div>
                  </div>
                </div>
                <div className={`card-art ${card.pal || "pal-a"}`}>
                  <div className="frame"></div>
                  <div className="bug"><span>APEX</span><span>{card.tag || "CRD"}</span></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="detail-copy">
          <div className="p-cat">{card.category}</div>
          <h1>{card.title}</h1>
          <div className="detail-price">{formatPrice(card.price)}</div>

          <AddToCartButton card={{
            id: card.id,
            title: card.title,
            price: card.price,
            grade: card.grade,
            category: card.category,
            imageUrl: card.imageUrl,
            cert: card.cert,
            sold: card.sold,
          }} />

          <div className="spec-list">
            <div className="spec-row"><span className="k">Grade</span><span className="v">{card.grade} / 10</span></div>
            <div className="spec-row"><span className="k">Certification</span><span className="v">{card.cert}</span></div>
            <div className="spec-row"><span className="k">Category</span><span className="v">{card.category}</span></div>
            <div className="spec-row"><span className="k">Availability</span><span className="v">{card.sold ? "Sold" : "In stock — 1 available"}</span></div>
          </div>

          <p style={{ color: "var(--grey)", fontSize: 14.5, lineHeight: 1.65, maxWidth: "48ch" }}>
            Graded in-house by Apex on the standard ten-point scale, checked by two independent graders before encapsulation. Each slab carries a scannable certificate and full subgrade breakdown on the reverse.
          </p>
        </div>
      </div>
    </div>
  );
}
