"use client";

import { useEffect, useState } from "react";
import ProductCard from "../../components/ProductCard";

const SINCE_DAYS = 14;

export default function NewArrivalsPage() {
  const [data, setData] = useState({ cards: [], total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/cards?sinceDays=${SINCE_DAYS}&sort=newest`)
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
          <div className="crumb"><a href="/">Home</a> / New Arrivals</div>
          <h1>New arrivals</h1>
          <p>Everything added in the last {SINCE_DAYS} days — graded and raw singles together.</p>
        </div>
      </div>

      <div className="wrap">
        <div className="result-count">
          {loading ? "Loading…" : `${data.total} card${data.total === 1 ? "" : "s"}`}
        </div>

        {!loading && data.cards.length === 0 ? (
          <div className="empty-state">
            <h3>Nothing new yet</h3>
            <p>Check back soon — new listings show up here as soon as they're added.</p>
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
