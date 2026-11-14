import { NextResponse } from "next/server";
import { createNotifyRequest } from "../../../lib/data";
import { checkRateLimit, recordFailedAttempt, getClientIp } from "../../../lib/rate-limit";

export async function POST(request) {
  const ip = getClientIp(request);
  const allowed = await checkRateLimit(ip, "notify_me", { maxAttempts: 10, windowMinutes: 15 });
  if (!allowed) {
    return NextResponse.json({ error: "Too many attempts. Try again in 15 minutes." }, { status: 429 });
  }
  await recordFailedAttempt(ip, "notify_me");

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
