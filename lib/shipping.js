// Shipping rates by region. These are placeholder estimates — replace with real
// rates once you've got actual courier quotes (Royal Mail International, etc.)
// for your typical parcel weight/size.
export const SHIPPING_REGIONS = {
  uk: {
    label: "United Kingdom",
    countries: ["GB"],
    standard: { amount: 399, label: "Standard tracked (3–5 days)", days: [3, 5] },
    express: { amount: 799, label: "Express tracked (1–2 days)", days: [1, 2] },
    customsNotice: false,
  },
  europe: {
    label: "Europe",
    countries: ["IE", "FR", "DE", "ES", "IT", "NL", "BE", "PT", "AT", "SE", "DK", "PL", "CH"],
    standard: { amount: 899, label: "Standard tracked (5–8 days)", days: [5, 8] },
    express: { amount: 1499, label: "Express tracked (2–4 days)", days: [2, 4] },
    customsNotice: true,
  },
  usCanada: {
    label: "USA & Canada",
    countries: ["US", "CA"],
    standard: { amount: 1299, label: "Standard tracked (7–12 days)", days: [7, 12] },
    express: { amount: 1999, label: "Express tracked (3–5 days)", days: [3, 5] },
    customsNotice: true,
  },
  restOfWorld: {
    label: "Rest of world (Asia, Australia & more)",
    countries: ["AU", "NZ", "JP", "SG", "HK", "AE", "KR", "TW"],
    standard: { amount: 1699, label: "Standard tracked (10–18 days)", days: [10, 18] },
    express: { amount: 2499, label: "Express tracked (4–7 days)", days: [4, 7] },
    customsNotice: true,
  },
};

export function getRegion(key) {
  return SHIPPING_REGIONS[key] || SHIPPING_REGIONS.uk;
}

// Free standard shipping on orders at or above this subtotal (in pence, before
// shipping is added). Express shipping still costs extra regardless — this
// only applies to the standard option. Change this single number to adjust
// the threshold anywhere on the site.
export const FREE_SHIPPING_THRESHOLD = 5000; // £50.00
