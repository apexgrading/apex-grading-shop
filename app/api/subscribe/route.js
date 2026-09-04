import { NextResponse } from "next/server";
import { addSubscriber } from "../../../lib/data";
import { sendEmail, welcomeEmailHtml } from "../../../lib/email";

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const email = body?.email?.trim().toLowerCase();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const isNew = addSubscriber(email);
  if (isNew) {
    sendEmail({ to: email, subject: "Welcome to Apex Cards", html: welcomeEmailHtml(email), type: "welcome" });
  }

  return NextResponse.json({ ok: true });
}
