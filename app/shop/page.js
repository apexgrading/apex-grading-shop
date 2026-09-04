"use client";

import { useEffect, useState, useCallback } from "react";
import ProductCard from "../../components/ProductCard";

const CATEGORIES = ["all", "Pokémon", "Sports", "TCG"];

export default function ShopPage() {
  const [category, setCategory] = useState("all");
  const [grade, setGrade] = useState("any");
  const [sort, setSort] = useState("newest");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [data, setData] = useState({ cards: [], total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (grade !== "any") params.set("grade", grade);
    params.set("sort", sort);
    if (search) params.set("search", search);
    params.set("page", String(page));

    const res = await fetch(`/api/cards?${params.toString()}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }, [category, grade, sort, search, page]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  useEffect(() => {
    setPage(1);
  }, [category, grade, sort, search]);

  function clearFilters() {
    setCategory("all");
    setGrade("any");
    setSort("newest");
    setSearch("");
    setPage(1);
  }

  return (
    <div>
      <div className="page-head">
        <div className="wrap">
          <div className="crumb"><a href="/">Home</a> / Shop</div>
          <h1>All graded cards</h1>
          <p>Every card here was graded by Apex — nothing resold from another service.</p>
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
          <div className="filter-spacer" />
          <div className="select-field">
            <span>Grade</span>
            <select value={grade} onChange={(e) => setGrade(e.target.value)}>
              <option value="any">Any</option>
              <option value="10">10 only</option>
              <option value="9">9+</option>
              <option value="7">7+</option>
              <option value="below7">Below 7</option>
            </select>
          </div>
          <div className="select-field">
            <span>Sort</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="newest">Newest</option>
              <option value="grade-desc">Grade: high to low</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </div>
          <div className="search-field">
            <input
              type="text"
              placeholder="Search cards or cert #"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="wrap">
        <div className="result-count">
          {loading ? "Loading…" : `${data.total} card${data.total === 1 ? "" : "s"}`}
        </div>

        {!loading && data.cards.length === 0 ? (
          <div className="empty-state">
            <h3>No cards match those filters</h3>
            <p>Try clearing a filter or searching a different term.</p>
            <button className="btn btn-secondary" onClick={clearFilters}>Clear all filters</button>
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
