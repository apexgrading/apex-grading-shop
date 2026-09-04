"use client";

import { useEffect, useState, useCallback } from "react";
import ProductCard from "../../components/ProductCard";

export default function SoldPage() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ cards: [], total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const fetchSold = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("soldOnly", "true");
    params.set("sort", "newest");
    params.set("page", String(page));

    const res = await fetch(`/api/cards?${params.toString()}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }, [page]);

  useEffect(() => {
    fetchSold();
  }, [fetchSold]);

  return (
    <div>
      <div className="page-head">
        <div className="wrap">
          <div className="crumb"><a href="/">Home</a> / Sold</div>
          <h1>Sold cards</h1>
          <p>A record of cards Apex has graded and sold — once it's here, it's off the market for good.</p>
        </div>
      </div>

      <div className="wrap">
        <div className="result-count">
          {loading ? "Loading…" : `${data.total} card${data.total === 1 ? "" : "s"} sold`}
        </div>

        {!loading && data.cards.length === 0 ? (
          <div className="empty-state">
            <h3>Nothing sold yet</h3>
            <p>Once a card sells, it'll show up here.</p>
          </div>
        ) : (
          <div className="shop-grid">
            {data.cards.map((card) => (
              <ProductCard key={card.id} card={card} />
            ))}
          </div>
        )}

        {data.totalPages > 1 && (
          <div className="pagination">
            <button className="page-btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>←</button>
            {Array.from({ length: data.totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === data.totalPages || Math.abs(p - page) <= 1)
              .map((p, idx, arr) => (
                <span key={p} style={{ display: "flex" }}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && <span className="page-btn" style={{ border: "none", cursor: "default" }}>…</span>}
                  <button
                    className={`page-btn ${p === page ? "active" : ""}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                </span>
              ))}
            <button className="page-btn" disabled={page === data.totalPages} onClick={() => setPage((p) => p + 1)}>→</button>
          </div>
        )}
      </div>
    </div>
  );
}
