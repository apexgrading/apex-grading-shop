"use client";

import { useState } from "react";

export default function CardImageViewer({ imageUrl, imageUrlBack, title, isGraded, grade, cert, category }) {
  const [showBack, setShowBack] = useState(false);
  const hasBack = !!imageUrlBack;

  return (
    <div className="card-frame">
      <div className="card-frame-top">
        <img src="/assets/apex-icon.jpg" alt="" className="card-frame-logo" />
        <div className="card-frame-brand">APEX GRADING</div>
      </div>

      <div className="card-frame-headline">
        {isGraded ? (
          <>
            <span className="grade-num">{grade}</span>
            <span className="grade-label">{grade === 10 ? "Gem Mint" : grade >= 9 ? "Mint" : "Graded"}</span>
          </>
        ) : (
          <span className="grade-label">Raw Single</span>
        )}
      </div>

      <div
        onClick={() => hasBack && setShowBack((v) => !v)}
        style={hasBack ? { cursor: "pointer" } : undefined}
        className="card-frame-photo"
      >
        <img
          src={showBack && imageUrlBack ? imageUrlBack : imageUrl}
          alt={`${title}${showBack ? " (back)" : ""}`}
        />
      </div>

      {hasBack && (
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
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

      <div className="card-frame-footer">
        {isGraded && cert && <span>Cert {cert}</span>}
        {isGraded && cert && category && <span className="dot">·</span>}
        {category && <span>{category}</span>}
      </div>
    </div>
  );
}
