"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomeSearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(e) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <form onSubmit={handleSubmit} className="home-search" style={{ maxWidth: 480, margin: "0 0 34px" }}>
      <div className="search-field" style={{ width: "100%" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginRight: 8, color: "var(--grey-dim)" }}>
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search cards"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="btn btn-primary" style={{ padding: "8px 14px", fontSize: 13, flexShrink: 0, marginLeft: 8 }}>
          Search
        </button>
      </div>
    </form>
  );
}
