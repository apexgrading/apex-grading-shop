import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createUser, getUserByEmail, createSession, addSubscriber, setVerifyToken } from "../../../../lib/data";
import { randomBytes, createHash } from "crypto";
import { hashPassword, newSessionToken, sessionExpiry, SESSION_COOKIE } from "../../../../lib/auth";
import { sendEmail, accountConfirmationHtml, adminNotificationHtml, SITE_URL } from "../../../../lib/email";
import { checkRateLimit, recordFailedAttempt, getClientIp } from "../../../../lib/rate-limit";

export async function POST(request) {
  const ip = getClientIp(request);
  const allowed = await checkRateLimit(ip, "signup", { maxAttempts: 5, windowMinutes: 30 });
  if (!allowed) {
    return NextResponse.json({ error: "Too many signup attempts. Try again later." }, { status: 429 });
  }
  // Every attempt counts here (not just failures) - the goal is capping total
  // account creation per IP within the window, not just blocking brute force.
  await recordFailedAttempt(ip, "signup");

  const body = await request.json().catch(() => null);
  const email = body?.email?.trim().toLowerCase();
  const password = body?.password;
  const subscribeToNewsletter = !!body?.subscribe;

  if (!email || !email.includes("@") || !password || password.length < 8) {
    return NextResponse.json(
      { error: "Enter a valid email and a password of at least 8 characters." },
      { status: 400 }
    );
  }

  if (await getUserByEmail(email)) {
    return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
  }

  const { salt, hash } = hashPassword(password);
  const user = await createUser({ email, passwordHash: hash, salt, subscribed: subscribeToNewsletter });
  // a one-time link proves they own this email (needed before My Orders shows anything)
  const verifyToken = randomBytes(32).toString("hex");
  await setVerifyToken(user.id, createHash("sha256").update(verifyToken).digest("hex"));
  const verifyUrl = `${SITE_URL}/api/auth/verify?token=${verifyToken}`;

  if (subscribeToNewsletter) {
    await addSubscriber(email);
  }

  // Always confirm the account was created — separate from, and sent regardless
  // of, the newsletter opt-in.
  await sendEmail({
    to: email,
    subject: "Confirm your email — Shop APEX Cards",
    html: accountConfirmationHtml(email, subscribeToNewsletter, verifyUrl),
    type: "account_confirmation",
  });

  await sendEmail({
    to: "hello@apexgradingcompany.com",
    subject: "New account created",
    html: adminNotificationHtml("New account created", `${email} just created an account on Shop APEX Cards.${subscribeToNewsletter ? " They also subscribed to the newsletter." : ""}`),
    type: "admin_notification",
  });

  const token = newSessionToken();
  await createSession(user.id, token, sessionExpiry());
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return NextResponse.json({ user: { id: user.id, email: user.email } });
}
