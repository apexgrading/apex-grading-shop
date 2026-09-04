import { NextResponse } from "next/server";
import { getCardById } from "../../../../lib/data";

export async function GET(request, { params }) {
  const id = parseInt(params.id, 10);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid card id" }, { status: 400 });
  }

  const card = getCardById(id);
  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  return NextResponse.json({ card });
}
