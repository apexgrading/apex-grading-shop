import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createUser, getUserByEmail, createSession, addSubscriber } from "../../../../lib/data";
import { hashPassword, newSessionToken, sessionExpiry, SESSION_COOKIE } from "../../../../lib/auth";
import { sendEmail, welcomeEmailHtml } from "../../../../lib/email";

export async function POST(request) {
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

  if (getUserByEmail(email)) {
    return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
  }

  const { salt, hash } = hashPassword(password);
  const user = createUser({ email, passwordHash: hash, salt, subscribed: subscribeToNewsletter });

  if (subscribeToNewsletter) {
    addSubscriber(email);
    sendEmail({ to: email, subject: "Welcome to Apex Grading", html: welcomeEmailHtml(email), type: "welcome" });
  }

  const token = newSessionToken();
  createSession(user.id, token, sessionExpiry());
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return NextResponse.json({ user: { id: user.id, email: user.email } });
}
