import { NextResponse } from "next/server";
import { createNotifyRequest } from "../../../lib/data";

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const email = body?.email?.trim();
  const category = body?.category?.trim() || null;
  const cardTitle = body?.cardTitle?.trim() || null;

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  await createNotifyRequest({ email, category, cardTitle });
  return NextResponse.json({ ok: true });
}
