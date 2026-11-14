import { NextResponse } from "next/server";
import { addSubscriber } from "../../../lib/data";
import { sendEmail, welcomeEmailHtml, adminNotificationHtml } from "../../../lib/email";
import { checkRateLimit, recordFailedAttempt, getClientIp } from "../../../lib/rate-limit";

export async function POST(request) {
  // Without this, anyone can repeatedly submit other people's addresses here
  // and have Apex Cards' own verified sender blast them with "Welcome" emails.
  const ip = getClientIp(request);
  const allowed = await checkRateLimit(ip, "subscribe", { maxAttempts: 8, windowMinutes: 15 });
  if (!allowed) {
    return NextResponse.json({ error: "Too many attempts. Try again in 15 minutes." }, { status: 429 });
  }
  await recordFailedAttempt(ip, "subscribe");

  const body = await request.json().catch(() => null);
  const email = body?.email?.trim().toLowerCase();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const isNew = await addSubscriber(email);
  if (isNew) {
    await sendEmail({ to: email, subject: "Welcome to Apex Cards", html: welcomeEmailHtml(email), type: "welcome" });
    await sendEmail({
      to: "hello@apexgradingcompany.com",
      subject: "New newsletter signup",
      html: adminNotificationHtml("New newsletter signup", `${email} just signed up to the Apex Cards newsletter.`),
      type: "admin_notification",
    });
  }

  return NextResponse.json({ ok: true });
}
