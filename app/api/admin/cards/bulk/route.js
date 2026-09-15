import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createCard, certExists, isValidAdminSession } from "../../../../../lib/data";
import { csvToObjects } from "../../../../../lib/csv";

async function requireAdmin() {
  const token = cookies().get("apex_admin")?.value;
  return isValidAdminSession(token);
}

const VALID_CATEGORIES = [
  "Pokémon", "Sports", "One Piece", "Magic: The Gathering", "Yu-Gi-Oh!",
  "Gundam", "Disney", "Marvel", "DC", "Star Wars",
];

export async function POST(request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const csvText = body?.csv;
  if (!csvText || typeof csvText !== "string") {
    return NextResponse.json({ error: "No CSV content provided." }, { status: 400 });
  }

  let rows;
  try {
    rows = csvToObjects(csvText);
  } catch (err) {
    return NextResponse.json({ error: "Couldn't parse that CSV: " + err.message }, { status: 400 });
  }

  if (rows.length === 0) {
    return NextResponse.json({ error: "No data rows found in the CSV." }, { status: 400 });
  }
  if (rows.length > 500) {
    return NextResponse.json({ error: "Max 500 rows per upload — split into batches." }, { status: 400 });
  }

  const results = { created: [], errors: [] };
  // Track cert numbers seen within this same batch, since certExists only checks the DB.
  const seenCerts = new Set();

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const line = i + 2; // +2: 1-indexed, plus header row

    const title = r.title?.trim();
    const category = r.category?.trim();
    const isGraded = (r.isGraded || "true").toLowerCase() !== "false";
    const grade = r.grade ? parseInt(r.grade, 10) : null;
    const cert = r.cert?.trim();
    const condition = r.condition?.trim();
    const priceRaw = parseFloat(r.price);
    const imageUrl = r.imageUrl?.trim() || null;
    const imageUrlBack = r.imageUrlBack?.trim() || null;
    const isPreorder = (r.isPreorder || "false").toLowerCase() === "true";
    const expectedDate = r.expectedDate?.trim() || null;

    if (!title) {
      results.errors.push({ line, error: "Missing title" });
      continue;
    }
    if (!category || !VALID_CATEGORIES.includes(category)) {
      results.errors.push({ line, error: `Invalid category "${category}" — must be one of: ${VALID_CATEGORIES.join(", ")}` });
      continue;
    }
    if (Number.isNaN(priceRaw) || priceRaw <= 0) {
      results.errors.push({ line, error: `Invalid price "${r.price}"` });
      continue;
    }

    if (isGraded) {
      if (!cert) {
        results.errors.push({ line, error: "Graded card missing cert number" });
        continue;
      }
      if (!grade || grade < 1 || grade > 10) {
        results.errors.push({ line, error: `Invalid grade "${r.grade}" — must be 1-10` });
        continue;
      }
      if (seenCerts.has(cert)) {
        results.errors.push({ line, error: `Duplicate cert "${cert}" within this upload` });
        continue;
      }
      if (await certExists(cert)) {
        results.errors.push({ line, error: `Cert "${cert}" already exists on the site` });
        continue;
      }
      seenCerts.add(cert);
    } else if (!condition) {
      results.errors.push({ line, error: "Raw single missing condition" });
      continue;
    }

    try {
      const card = await createCard({
        title, category, grade, cert,
        price: Math.round(priceRaw * 100),
        imageUrl, imageUrlBack, isGraded, condition, isPreorder, expectedDate,
      });
      results.created.push({ line, id: card.id, title: card.title });
    } catch (err) {
      results.errors.push({ line, error: err.message });
    }
  }

  return NextResponse.json(results);
}
