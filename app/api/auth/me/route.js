import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "../../../../lib/data";
import { SESSION_COOKIE } from "../../../../lib/auth";

export async function GET() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const user = token ? getSession(token) : null;
  return NextResponse.json({ user: user ? { id: user.id, email: user.email } : null });
}
