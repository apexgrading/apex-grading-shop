import { NextResponse } from "next/server";
import { listCards } from "../../../lib/data";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const grade = searchParams.get("grade");
  const sort = searchParams.get("sort") || "newest";
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const includeSold = searchParams.get("includeSold") === "true";

  const result = listCards({ category, grade, sort, search, page, includeSold });
  return NextResponse.json(result);
}
