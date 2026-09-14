import Link from "next/link";

function formatPrice(cents) {
  return `£${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 0 })}`;
}

export default function ProductCard({ card }) {
  return (
    <div className="product">
      <Link href={`/cards/${card.id}`}>
        <div className="product-media">
          {card.sold && <div className="sold-ribbon">Sold</div>}
          {!card.sold && card.isPreorder && <div className="preorder-ribbon">Pre-order</div>}
          {card.imageUrl ? (
            <div className="real-photo">
              <img
                src={card.imageUrl}
                alt={card.isGraded ? `${card.title}, graded ${card.grade} by Apex Grading` : `${card.title}, raw single`}
              />
            </div>
          ) : card.isGraded ? (
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
                <div className="bug">
                  <span>APEX</span>
                  <span>{card.tag || "CRD"}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className={`card-art single-art ${card.pal || "pal-a"}`} style={{ aspectRatio: "5/7", borderRadius: 6 }}>
              <div className="frame"></div>
              <div className="bug"><span>RAW</span><span>{card.condition}</span></div>
            </div>
          )}
        </div>
        <div className="p-cat">{card.category}</div>
        <h4>{card.title}</h4>
        <div className="p-foot">
          <div className="price">{formatPrice(card.price)}</div>
          <div className="p-grade">{card.isGraded ? `Grade ${card.grade}` : card.condition}</div>
        </div>
        {card.isPreorder && !card.sold && card.expectedDate && (
          <div style={{ fontSize: 11.5, color: "#3B7DD8", marginTop: 4 }}>Expected {card.expectedDate}</div>
        )}
      </Link>
    </div>
  );
}
