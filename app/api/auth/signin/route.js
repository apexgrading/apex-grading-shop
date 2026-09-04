import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserByEmail, createSession } from "../../../../lib/data";
import { verifyPassword, newSessionToken, sessionExpiry, SESSION_COOKIE } from "../../../../lib/auth";

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const email = body?.email?.trim().toLowerCase();
  const password = body?.password;

  if (!email || !password) {
    return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });
  }

  const user = getUserByEmail(email);
  if (!user || !verifyPassword(password, user.salt, user.passwordHash)) {
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
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
