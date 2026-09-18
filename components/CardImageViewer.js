"use client";

import { useState } from "react";

export default function CardImageViewer({ imageUrl, imageUrlBack, title, isGraded, grade, cert, category }) {
  const [showBack, setShowBack] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const hasBack = !!imageUrlBack;
  const currentImage = showBack && imageUrlBack ? imageUrlBack : imageUrl;

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
        style={{ position: "relative", ...(hasBack ? { cursor: "pointer" } : {}) }}
        className="card-frame-photo"
      >
        <img src={currentImage} alt={`${title}${showBack ? " (back)" : ""}`} />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setZoomed(true);
          }}
          className="card-frame-zoom-btn"
          aria-label="Enlarge photo"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </button>
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

      {zoomed && (
        <div
          onClick={() => setZoomed(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 100,
            display: "flex", alignItems: "center", justifyContent: "center", padding: 24, cursor: "zoom-out",
          }}
        >
          <img src={currentImage} alt={`${title}${showBack ? " (back)" : ""} enlarged`} style={{ maxWidth: "92vw", maxHeight: "92vh", borderRadius: 8 }} />
          <button
            onClick={(e) => { e.stopPropagation(); setZoomed(false); }}
            aria-label="Close"
            style={{
              position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.1)", border: "none",
              color: "#fff", width: 40, height: 40, borderRadius: "50%", fontSize: 18, cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
