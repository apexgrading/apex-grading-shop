import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes, createHash } from "crypto";
import { getSession, setVerifyToken, verifyEmailByTokenHash } from "../../../../lib/data";
import { SESSION_COOKIE } from "../../../../lib/auth";
import { sendEmail, verifyEmailHtml, SITE_URL } from "../../../../lib/email";
import { checkRateLimit, recordFailedAttempt, getClientIp } from "../../../../lib/rate-limit";

// GET /api/auth/verify?token=… — the link in the email. Works once, for 48 hours.
export async function GET(request) {
  const token = new URL(request.url).searchParams.get("token") || "";
  const base = SITE_URL || new URL(request.url).origin;
  if (!/^[a-f0-9]{64}$/.test(token)) return NextResponse.redirect(`${base}/account/orders?verify=failed`);
  const user = await verifyEmailByTokenHash(createHash("sha256").update(token).digest("hex")).catch(() => null);
  return NextResponse.redirect(`${base}/account/orders?verify=${user ? "ok" : "failed"}`);
}

// POST /api/auth/verify — signed in, not yet confirmed: email a fresh link (max 3 an hour)
export async function POST(request) {
  const sess = cookies().get(SESSION_COOKIE)?.value;
  const user = sess ? await getSession(sess) : null;
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  if (user.emailVerifiedAt) return NextResponse.json({ ok: true, already: true });
  const ip = getClientIp(request);
  if (!(await checkRateLimit(ip, "verify_email", { maxAttempts: 3, windowMinutes: 60 }))) {
    return NextResponse.json({ error: "We've sent a few links already — check your inbox (and junk), or try again in an hour." }, { status: 429 });
  }
  await recordFailedAttempt(ip, "verify_email");
  const token = randomBytes(32).toString("hex");
  await setVerifyToken(user.id, createHash("sha256").update(token).digest("hex"));
  await sendEmail({ to: user.email, subject: "Confirm your email — Shop APEX Cards", html: verifyEmailHtml(user.email, `${SITE_URL}/api/auth/verify?token=${token}`), type: "verify_email" });
  return NextResponse.json({ ok: true });
}
