import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSetting, setSetting, isValidAdminSession } from "../../../../../lib/data";

async function requireAdmin() {
  const token = (await cookies()).get("apex_admin")?.value;
  return isValidAdminSession(token);
}

// Defaults to blurred (unset = true) until explicitly switched off here.
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const value = await getSetting("slabs_blurred");
  return NextResponse.json({ blurred: value !== "false" });
}

export async function POST(request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const blurred = !!body?.blurred;
  await setSetting("slabs_blurred", blurred ? "true" : "false");
  return NextResponse.json({ ok: true, blurred });
}
