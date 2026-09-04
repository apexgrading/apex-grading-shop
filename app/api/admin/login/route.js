import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminSession } from "../../../../lib/data";
import { newSessionToken, sessionExpiry } from "../../../../lib/auth";

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const password = body?.password;

  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD is not set on the server yet — add it to .env." },
      { status: 500 }
    );
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const token = newSessionToken();
  createAdminSession(token, sessionExpiry());
  cookies().set("apex_admin", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return NextResponse.json({ ok: true });
}
