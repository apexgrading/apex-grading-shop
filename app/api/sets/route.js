import { NextResponse } from "next/server";
import { listDistinctSets } from "../../../lib/data";

export async function GET() {
  const sets = await listDistinctSets();
  return NextResponse.json({ sets });
}
