import { NextResponse } from "next/server";
import { addSubscriber } from "../../../lib/data";
import { sendEmail, welcomeEmailHtml, adminNotificationHtml } from "../../../lib/email";
import { guardPublicForm, looksLikeEmail } from "../../../lib/bot-check";
import { checkRateLimit, recordFailedAttempt } from "../../../lib/rate-limit";

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const email = body?.email?.trim().toLowerCase();

  if (!looksLikeEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  const blocked = await guardPublicForm(request, body, "subscribe");
  if (blocked) return NextResponse.json({ error: blocked.error }, { status: blocked.status });

  const isNew = await addSubscriber(email);
  // Site-wide safety cap on welcome emails, in case a bot gets past the checks
  const underCap = await checkRateLimit("all", "welcome-email", { maxAttempts: 60, windowMinutes: 60 });
  if (isNew && underCap) {
    await recordFailedAttempt("all", "welcome-email");
    await sendEmail({ to: email, subject: "Welcome to Shop APEX Cards", html: welcomeEmailHtml(email), type: "welcome" });
    await sendEmail({
      to: "hello@apexgradingcompany.com",
      subject: "New newsletter signup",
      html: adminNotificationHtml("New newsletter signup", `${email} just signed up to the Shop APEX Cards newsletter.`),
      type: "admin_notification",
    });
  }

  return NextResponse.json({ ok: true });
}
