"use client";

import { useState } from "react";

export default function CardImageViewer({ imageUrl, imageUrlBack, title }) {
  const [showBack, setShowBack] = useState(false);
  const hasBack = !!imageUrlBack;

  return (
    <div>
      <div
        onClick={() => hasBack && setShowBack((v) => !v)}
        style={hasBack ? { cursor: "pointer" } : undefined}
      >
        <img
          src={showBack && imageUrlBack ? imageUrlBack : imageUrl}
          alt={`${title}${showBack ? " (back)" : ""}`}
        />
      </div>
      {hasBack && (
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button
            type="button"
            onClick={() => setShowBack(false)}
            className={`btn ${!showBack ? "btn-primary" : "btn-secondary"}`}
            style={{ flex: 1, padding: "8px 0", fontSize: 13 }}
          >
            Front
          </button>
          <button
            type="button"
            onClick={() => setShowBack(true)}
            className={`btn ${showBack ? "btn-primary" : "btn-secondary"}`}
            style={{ flex: 1, padding: "8px 0", fontSize: 13 }}
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
}
