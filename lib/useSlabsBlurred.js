"use client";

import { useEffect, useState } from "react";

// Shared across every ProductCard/CardImageViewer instance on a page, so
// rendering a whole grid of slabs only fires one request, not one per card.
let cachedPromise = null;
function fetchBlurSetting() {
  if (!cachedPromise) {
    cachedPromise = fetch("/api/settings/slabs-blur")
      .then((r) => r.json())
      .then((d) => !!d.blurred)
      .catch(() => true); // fail closed - stay blurred rather than leak a photo
  }
  return cachedPromise;
}

// Whether graded slab photos should stay blurred site-wide (toggled in
// /admin). Starts `true` so there's no flash of an unblurred image before
// the real setting loads.
export function useSlabsBlurred() {
  const [blurred, setBlurred] = useState(true);
  useEffect(() => {
    let active = true;
    fetchBlurSetting().then((v) => {
      if (active) setBlurred(v);
    });
    return () => {
      active = false;
    };
  }, []);
  return blurred;
}
