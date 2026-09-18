import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession, listOrders } from "../../../../lib/data";
import { SESSION_COOKIE } from "../../../../lib/auth";
import { trackingUrl } from "../../../../lib/email";

export async function GET() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const user = token ? await getSession(token) : null;

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  // Orders aren't linked by a user_id — matched by email, since that's what
  // Stripe Checkout captures regardless of whether someone was signed in at
  // checkout. This means a guest order placed under a different email won't
  // show here.
  const allOrders = await listOrders();
  const mine = allOrders
    .filter((o) => o.email && o.email.toLowerCase() === user.email.toLowerCase() && o.status !== "pending")
    .map((o) => ({ ...o, trackingUrl: trackingUrl(o.carrier, o.trackingNumber) }));

  return NextResponse.json({ orders: mine });
}
