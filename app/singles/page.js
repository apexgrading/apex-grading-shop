"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
];

const CONDITIONS = ["any", "Near Mint", "Lightly Played", "Moderately Played", "Heavily Played", "Damaged"];

export default function SinglesPage() {
  return (
    <Suspense fallback={null}>
      <SinglesPageInner />
    </Suspense>
  );
}

function SinglesPageInner() {
  const urlParams = useSearchParams();
  const [category, setCategory] = useState("all");
  const [condition, setCondition] = useState("any");
  const [sort, setSort] = useState("newest");
  const [search, setSearch] = useState(urlParams.get("search") || "");
  const [page, setPage] = useState(1);
  const [setFilter, setSetFilter] = useState("all");
  const [availableSets, setAvailableSets] = useState([]);
  const [languageFilter, setLanguageFilter] = useState("all");

  const [data, setData] = useState({ cards: [], total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sets")
      .then((r) => r.json())
      .then((d) => setAvailableSets(d.sets || []))
      .catch(() => {});
  }, []);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("graded", "false");
    params.set("excludeCondition", "Sealed");
    if (category !== "all") params.set("category", category);
    if (setFilter !== "all") params.set("set", setFilter);
    if (languageFilter !== "all") params.set("language", languageFilter);
    params.set("sort", sort);
    if (search) params.set("search", search);
    params.set("page", String(page));

    const res = await fetch(`/api/cards?${params.toString()}`);
    const json = await res.json();
    // Condition filtering happens client-side since it's not a grade-based query
    const cards = condition === "any" ? json.cards : json.cards.filter((c) => c.condition === condition);
    setData({ ...json, cards, total: condition === "any" ? json.total : cards.length });
    setLoading(false);
  }, [category, condition, sort, search, page, setFilter, languageFilter]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  useEffect(() => {
    setPage(1);
  }, [category, condition, sort, search, setFilter, languageFilter]);

  function clearFilters() {
    setCategory("all");
    setCondition("any");
    setSort("newest");
    setSearch("");
    setSetFilter("all");
    setLanguageFilter("all");
    setPage(1);
  }

  return (
    <div>
      <div className="page-head">
        <div className="wrap">
          <div className="crumb"><a href="/">Home</a> / Singles</div>
          <h1>Raw singles</h1>
          <p>Ungraded, single cards — same authentication standard, no slab.</p>
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
            <span>Condition</span>
            <select value={condition} onChange={(e) => setCondition(e.target.value)}>
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>{c === "any" ? "Any" : c}</option>
              ))}
            </select>
          </div>
          {availableSets.length > 0 && (
            <div className="select-field">
              <span>Set</span>
              <select value={setFilter} onChange={(e) => setSetFilter(e.target.value)}>
                <option value="all">All sets</option>
                {availableSets.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}
          <div className="select-field">
            <span>Language</span>
            <select value={languageFilter} onChange={(e) => setLanguageFilter(e.target.value)}>
              <option value="all">All languages</option>
              <option value="English">English</option>
              <option value="Japanese">Japanese</option>
              <option value="Chinese">Chinese</option>
              <option value="Korean">Korean</option>
            </select>
          </div>
          <div className="select-field">
            <span>Sort</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="a-z">Name: A to Z</option>
            </select>
          </div>
          <div className="search-field">
            <input
              type="text"
              placeholder="Search singles"
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
            <h3>No singles match those filters</h3>
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

        {data.totalPages > 1 && condition === "any" && (
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
