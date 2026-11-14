import { NextResponse } from "next/server";
import { createNotifyRequest } from "../../../lib/data";
import { guardPublicForm, looksLikeEmail } from "../../../lib/bot-check";

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const email = body?.email?.trim();
  const category = body?.category?.trim() || null;
  const cardTitle = body?.cardTitle?.trim() || null;

  if (!looksLikeEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  const blocked = await guardPublicForm(request, body, "notify-me", { perHour: 10 });
  if (blocked) return NextResponse.json({ error: blocked.error }, { status: blocked.status });

  await createNotifyRequest({ email, category, cardTitle });
  return NextResponse.json({ ok: true });
}
