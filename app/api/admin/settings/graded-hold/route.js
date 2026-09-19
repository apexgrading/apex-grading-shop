import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSetting, setSetting, isValidAdminSession } from "../../../../../lib/data";

async function requireAdmin() {
  const token = cookies().get("apex_admin")?.value;
  return isValidAdminSession(token);
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const value = await getSetting("graded_cards_on_hold");
  return NextResponse.json({ onHold: value === "true" });
}

export async function POST(request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const onHold = !!body?.onHold;
  await setSetting("graded_cards_on_hold", onHold ? "true" : "false");
  return NextResponse.json({ ok: true, onHold });
}
