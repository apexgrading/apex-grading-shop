import { NextResponse } from "next/server";
import { getSetting } from "../../../../lib/data";

export const dynamic = "force-dynamic";

// Defaults to blurred (unset = true) so slab photos stay hidden until the
// site is explicitly switched over in /admin, rather than needing a DB
// migration to seed the setting before this ever launches.
export async function GET() {
  const value = await getSetting("slabs_blurred");
  return NextResponse.json({ blurred: value !== "false" });
}
