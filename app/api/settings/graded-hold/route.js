import { NextResponse } from "next/server";
import { getSetting } from "../../../../lib/data";

export async function GET() {
  const value = await getSetting("graded_cards_on_hold");
  return NextResponse.json({ onHold: value === "true" });
}
