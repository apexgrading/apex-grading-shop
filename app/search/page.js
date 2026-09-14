"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "../../components/ProductCard";

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchPageInner />
    </Suspense>
  );
}

function SearchPageInner() {
  const urlParams = useSearchParams();
  const router = useRouter();
  const initialQuery = urlParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [data, setData] = useState({ cards: [], total: 0 });
  const [loading, setLoading] = useState(!!initialQuery);

  const runSearch = useCallback(async (q) => {
    if (!q) {
      setData({ cards: [], total: 0 });
      return;
    }
    setLoading(true);
    // No `graded` param — this deliberately searches across both graded cards
    // and raw singles at once, unlike /shop and /singles which are scoped.
    const res = await fetch(`/api/cards?search=${encodeURIComponent(q)}&sort=newest`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }, []);

  useEffect(() => {
    runSearch(initialQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  function handleSubmit(e) {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <div>
      <div className="page-head">
        <div className="wrap">
          <div className="crumb"><a href="/">Home</a> / Search</div>
          <h1>Search all cards</h1>
          <p>Checks graded cards and raw singles together.</p>
        </div>
      </div>

      <div className="filter-bar">
        <div className="wrap">
          <form onSubmit={handleSubmit} className="search-field" style={{ maxWidth: 480 }}>
            <input
              type="text"
              placeholder="Search by card name, set, or cert #"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </form>
        </div>
      </div>

      <div className="wrap">
        <div className="result-count">
          {!initialQuery ? "Enter a search above" : loading ? "Searching…" : `${data.total} result${data.total === 1 ? "" : "s"} for "${initialQuery}"`}
        </div>

        {!loading && initialQuery && data.cards.length === 0 ? (
          <div className="empty-state">
            <h3>No matches</h3>
            <p>Try a different card name, set, or cert number.</p>
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
