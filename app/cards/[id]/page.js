import { notFound } from "next/navigation";
import Link from "next/link";
import { getCardById } from "../../../lib/data";
import AddToCartButton from "../../../components/AddToCartButton";
import CardImageViewer from "../../../components/CardImageViewer";
import NotifyMeForm from "../../../components/NotifyMeForm";

function formatPrice(cents) {
  return `£${(cents / 100).toLocaleString()}`;
}

export default async function CardDetailPage({ params }) {
  const id = parseInt(params.id, 10);
  if (Number.isNaN(id)) notFound();

  const card = await getCardById(id);
  if (!card) notFound();

  return (
    <div className="wrap">
      <div style={{ padding: "24px 0 0", fontSize: 13, color: "var(--grey-dim)" }}>
        <Link href="/">Home</Link> / <Link href="/shop">Shop</Link> / {card.title}
      </div>

      <div className="detail-grid">
        <div className="detail-stage">
          {card.imageUrl ? (
            <CardImageViewer
              imageUrl={card.imageUrl}
              imageUrlBack={card.imageUrlBack}
              title={card.title}
              isGraded={card.isGraded}
              grade={card.grade}
              cert={card.cert}
              category={card.category}
            />
          ) : card.isGraded ? (
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
          ) : (
            <div style={{ width: 280 }}>
              <div className={`card-art ${card.pal || "pal-a"}`} style={{ aspectRatio: "5/7", borderRadius: 6 }}>
                <div className="frame"></div>
                <div className="bug"><span>RAW</span><span>{card.condition}</span></div>
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
            isGraded: card.isGraded,
            condition: card.condition,
          }} />

          <div className="spec-list">
            {card.isGraded ? (
              <>
                <div className="spec-row"><span className="k">Grade</span><span className="v">{card.grade} / 10</span></div>
                <div className="spec-row"><span className="k">Certification</span><span className="v">{card.cert}</span></div>
              </>
            ) : (
              <div className="spec-row"><span className="k">Condition</span><span className="v">{card.condition}</span></div>
            )}
            <div className="spec-row"><span className="k">Category</span><span className="v">{card.category}</span></div>
            <div className="spec-row">
              <span className="k">Availability</span>
              <span className="v">
                {card.sold
                  ? "Sold"
                  : card.isStockItem && card.quantity <= 0
                  ? "Out of Stock"
                  : card.isPreorder
                  ? `Pre-order${card.expectedDate ? ` — expected ${card.expectedDate}` : ""}`
                  : card.isStockItem
                  ? `In stock — ${card.quantity} available`
                  : "In stock — 1 available"}
              </span>
            </div>
          </div>

          {card.isPreorder && !card.sold && (
            <p style={{
              fontSize: 13.5, color: "#8FB8EA", background: "rgba(59,125,216,0.12)",
              border: "1px solid rgba(59,125,216,0.3)", borderRadius: 6, padding: "10px 14px", margin: "0 0 20px",
            }}>
              This is a pre-order — you're reserving this card ahead of arrival. Payment is taken now; it ships once it's in hand.
            </p>
          )}

          {(card.sold || (card.isStockItem && card.quantity <= 0)) && (
            <div style={{
              background: "var(--bg-panel)", border: "1px solid var(--line)", borderRadius: 6,
              padding: "14px 16px", margin: "0 0 20px",
            }}>
              <NotifyMeForm category={card.category} cardTitle={card.title} />
            </div>
          )}

          <p style={{ color: "var(--grey)", fontSize: 14.5, lineHeight: 1.65, maxWidth: "48ch" }}>
            {card.isGraded
              ? "Graded in-house by Apex on the standard ten-point scale, checked by two independent graders before encapsulation. Each slab carries a scannable certificate and full subgrade breakdown on the reverse."
              : "A raw, ungraded single — authenticated by Apex and assessed for condition, but not encapsulated. Same standard for spotting alterations or counterfeits, without the slab."}
          </p>
        </div>
      </div>
    </div>
  );
}
