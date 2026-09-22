import { NextResponse } from "next/server";
import { listDistinctSets } from "../../../lib/data";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || null;
  const sets = await listDistinctSets(category);
  return NextResponse.json({ sets });
}
