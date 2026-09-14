"use client";

import { useEffect, useState } from "react";
import ProductCard from "../../components/ProductCard";

export default function PreordersPage() {
  const [data, setData] = useState({ cards: [], total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/cards?preorder=true&sort=newest`)
      .then((r) => r.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <div className="page-head">
        <div className="wrap">
          <div className="crumb"><a href="/">Home</a> / Pre-orders</div>
          <h1>Pre-orders</h1>
          <p>Reserve these now — not yet in hand, ships once they arrive.</p>
        </div>
      </div>

      <div className="wrap">
        <div className="result-count">
          {loading ? "Loading…" : `${data.total} card${data.total === 1 ? "" : "s"}`}
        </div>

        {!loading && data.cards.length === 0 ? (
          <div className="empty-state">
            <h3>No pre-orders open right now</h3>
            <p>Check back soon, or browse what's already in stock.</p>
          </div>
        ) : (
          <div className="shop-grid">
            {data.cards.map((card) => (
              <ProductCard key={card.id} card={card} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
