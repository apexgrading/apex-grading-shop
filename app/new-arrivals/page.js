"use client";

import { useEffect, useState, useCallback } from "react";
import ProductCard from "../../components/ProductCard";

const SINCE_DAYS = 14;
const CATEGORIES = [
  "all",
  "Pokémon",
  "Sports",
  "One Piece",
  "Magic: The Gathering",
  "Yu-Gi-Oh!",
  "Gundam",
  "Disney",
  "Marvel",
  "DC",
  "Star Wars",
];

export default function NewArrivalsPage() {
  const [category, setCategory] = useState("all");
  const [data, setData] = useState({ cards: [], total: 0 });
  const [loading, setLoading] = useState(true);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("sinceDays", String(SINCE_DAYS));
    params.set("sort", "newest");
    if (category !== "all") params.set("category", category);
    else params.set("excludeCategory", "Mystery Slabs");

    const res = await fetch(`/api/cards?${params.toString()}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }, [category]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  return (
    <div>
      <div className="page-head">
        <div className="wrap">
          <div className="crumb"><a href="/">Home</a> / New Arrivals</div>
          <h1>New arrivals</h1>
          <p>Everything added in the last {SINCE_DAYS} days — graded and raw singles together.</p>
        </div>
      </div>

      <div className="filter-bar">
        <div className="wrap filter-row">
          <div className="chip-group">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                className={`chip ${category === c ? "active" : ""}`}
                onClick={() => setCategory(c)}
              >
                {c === "all" ? "All" : c}
              </button>
            ))}
          </div>
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
