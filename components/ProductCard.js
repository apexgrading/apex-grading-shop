import Link from "next/link";

function formatPrice(cents) {
  return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 0 })}`;
}

export default function ProductCard({ card }) {
  return (
    <div className="product">
      <Link href={`/cards/${card.id}`}>
        {card.imageUrl ? (
          <div className="real-photo">
            <img src={card.imageUrl} alt={`${card.title}, graded ${card.grade} by Apex Grading`} />
          </div>
        ) : (
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
        )}
        <div className="p-cat">{card.category}</div>
        <h4>{card.title}</h4>
        <div className="p-foot">
          <div className="price">{formatPrice(card.price)}</div>
          <div className="p-grade">Grade {card.grade}</div>
        </div>
        {card.sold && <div className="sold-tag">Sold</div>}
      </Link>
    </div>
  );
}
