"use client";

import { useEffect, useState, useCallback } from "react";
import ProductCard from "../../components/ProductCard";

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
  "Mystery Slabs",
];

export default function PreordersPage() {
  const [category, setCategory] = useState("all");
  const [data, setData] = useState({ cards: [], total: 0 });
  const [loading, setLoading] = useState(true);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("preorder", "true");
    params.set("sort", "newest");
    if (category !== "all") params.set("category", category);

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
          <div className="crumb"><a href="/">Home</a> / Pre-orders</div>
          <h1>Pre-orders</h1>
          <p>Reserve these now — not yet in hand, ships once they arrive.</p>
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
