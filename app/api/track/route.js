import { NextResponse } from "next/server";
import { getOrderById } from "../../../lib/data";
import { trackingUrl } from "../../../lib/email";
import { checkRateLimit, recordFailedAttempt, getClientIp } from "../../../lib/rate-limit";

export async function POST(request) {
  // Guards against brute-forcing order IDs/emails to enumerate other customers' orders.
  const ip = getClientIp(request);
  const allowed = await checkRateLimit(ip, "track_order", { maxAttempts: 15, windowMinutes: 15 });
  if (!allowed) {
    return NextResponse.json({ error: "Too many attempts. Try again in 15 minutes." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const orderId = parseInt(body?.orderId, 10);
  const email = body?.email?.trim().toLowerCase();

  if (Number.isNaN(orderId) || !email) {
    return NextResponse.json({ error: "Enter a valid order number and email." }, { status: 400 });
  }

  const order = await getOrderById(orderId);

  if (!order || (order.email || "").toLowerCase() !== email) {
    await recordFailedAttempt(ip, "track_order");
    return NextResponse.json({ error: "No matching order found. Double-check the order number and email." }, { status: 404 });
  }

  return NextResponse.json({
    order: {
      id: order.id,
      status: order.status,
      items: order.items.map((i) => ({ title: i.card.title })),
      carrier: order.carrier,
      trackingNumber: order.trackingNumber,
      trackingUrl: trackingUrl(order.carrier, order.trackingNumber),
      shippedAt: order.shippedAt,
      createdAt: order.createdAt,
    },
  });
}
