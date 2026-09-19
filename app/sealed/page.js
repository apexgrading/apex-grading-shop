"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import AddToCartButton from "../../components/AddToCartButton";

function formatPrice(cents) {
  return `£${(cents / 100).toLocaleString()}`;
}

export default function SealedProductPage() {
  const [allCards, setAllCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stockFilter, setStockFilter] = useState({ inStock: true, outOfStock: true });
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const fetchCards = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("condition", "Sealed");
    params.set("sort", "newest");
    if (minPrice) params.set("minPrice", String(Math.round(parseFloat(minPrice) * 100)));
    if (maxPrice) params.set("maxPrice", String(Math.round(parseFloat(maxPrice) * 100)));

    // This page needs the FULL dataset (not just one page) since Stock Status
    // and Price filtering both happen client-side — otherwise items past the
    // site's standard 24-per-page limit silently disappear.
    let page = 1;
    let all = [];
    let totalPages = 1;
    do {
      params.set("page", String(page));
      const res = await fetch(`/api/cards?${params.toString()}`);
      const json = await res.json();
      all = all.concat(json.cards || []);
      totalPages = json.totalPages || 1;
      page += 1;
    } while (page <= totalPages && page <= 20); // hard safety cap

    setAllCards(all);
    setLoading(false);
  }, [minPrice, maxPrice]);

  useEffect(() => { fetchCards(); }, [fetchCards]);

  function isOutOfStock(card) {
    return card.isStockItem ? card.quantity <= 0 : false;
  }

  const filtered = allCards
    .filter((card) => {
      const oos = isOutOfStock(card);
      if (oos && !stockFilter.outOfStock) return false;
      if (!oos && !stockFilter.inStock) return false;
      return true;
    })
    .sort((a, b) => {
      // Real photos first, generic fallback items pushed to the bottom.
      const aHas = a.imageUrl ? 0 : 1;
      const bHas = b.imageUrl ? 0 : 1;
      return aHas - bHas;
    });

  return (
    <div>
      <div className="page-head">
        <div className="wrap">
          <div className="crumb"><Link href="/">Home</Link> / Sealed Product</div>
          <h1>Sealed Product</h1>
          <p>Elite Trainer Boxes, booster packs, and booster boxes — factory sealed, straight from the case.</p>
        </div>
      </div>

      <div className="wrap sealed-layout" style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 32, padding: "32px 32px 100px" }}>
        {/* Sidebar filters */}
        <aside>
          <h3 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--grey-dim)", marginBottom: 16 }}>
            Narrow by
          </h3>

          <div style={{ marginBottom: 24 }}>
            <h4 style={{ fontSize: 13.5, fontWeight: 600, color: "var(--gold-light)", marginBottom: 10 }}>Stock Status</h4>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "var(--grey)", cursor: "pointer", marginBottom: 6 }}>
              <input
                type="checkbox"
                checked={stockFilter.inStock}
                onChange={(e) => setStockFilter((s) => ({ ...s, inStock: e.target.checked }))}
              />
              In Stock
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "var(--grey)", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={stockFilter.outOfStock}
                onChange={(e) => setStockFilter((s) => ({ ...s, outOfStock: e.target.checked }))}
              />
              Out of Stock
            </label>
          </div>

          <div style={{ marginBottom: 24 }}>
            <h4 style={{ fontSize: 13.5, fontWeight: 600, color: "var(--gold-light)", marginBottom: 10 }}>Price</h4>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="number"
                min="0"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                style={{
                  width: "100%", background: "var(--bg-panel)", border: "1px solid var(--line)",
                  borderRadius: 4, padding: "8px 10px", color: "var(--white)", fontSize: 13,
                }}
              />
              <span style={{ color: "var(--grey-dim)" }}>–</span>
              <input
                type="number"
                min="0"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                style={{
                  width: "100%", background: "var(--bg-panel)", border: "1px solid var(--line)",
                  borderRadius: 4, padding: "8px 10px", color: "var(--white)", fontSize: 13,
                }}
              />
            </div>
          </div>
        </aside>

        {/* Results */}
        <div>
          <div className="result-count" style={{ marginBottom: 16 }}>
            {loading ? "Loading…" : `${filtered.length} result${filtered.length === 1 ? "" : "s"}`}
          </div>

          {!loading && filtered.length === 0 ? (
            <div className="empty-state">
              <h3>No sealed product available right now</h3>
              <p>Check back soon, or browse the graded card shop instead.</p>
              <Link href="/shop" className="btn btn-primary">Shop graded cards</Link>
            </div>
          ) : (
            <div className="shop-grid">
              {filtered.map((card) => {
                const oos = isOutOfStock(card);
                return (
                  <div key={card.id} style={{ display: "flex", flexDirection: "column" }}>
                    <Link href={`/cards/${card.id}`} style={{ position: "relative" }}>
                      {oos && (
                        <div style={{
                          position: "absolute", top: 10, right: 10, zIndex: 3,
                          background: "#3A3A38", color: "var(--white)", fontSize: 11, fontWeight: 700,
                          letterSpacing: "0.04em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 4,
                        }}>
                          Out of Stock
                        </div>
                      )}
                      {card.imageUrl ? (
                        <div className="real-photo grid-frame grid-frame-landscape">
                          <img src={card.imageUrl} alt={card.title} />
                          <img src="/assets/apex-icon.jpg" alt="" className="grid-frame-badge" />
                        </div>
                      ) : (
                        <div className={`card-art single-art ${card.pal || "pal-a"}`} style={{ aspectRatio: "1", borderRadius: 6 }}>
                          <div className="frame"></div>
                          <div className="bug"><span>SEALED</span></div>
                        </div>
                      )}
                      <div className="p-cat">{card.category}</div>
                      <h4>{card.title}</h4>
                      <div className="p-foot">
                        <div className="price">{formatPrice(card.price)}</div>
                        {card.isStockItem && !oos && <div className="p-grade">{card.quantity} in stock</div>}
                      </div>
                    </Link>
                    <div style={{ marginTop: 10 }}>
                      <AddToCartButton card={card} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
