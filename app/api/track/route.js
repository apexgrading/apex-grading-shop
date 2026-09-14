import { NextResponse } from "next/server";
import { getOrderById } from "../../../lib/data";
import { trackingUrl } from "../../../lib/email";

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const orderId = parseInt(body?.orderId, 10);
  const email = body?.email?.trim().toLowerCase();

  if (Number.isNaN(orderId) || !email) {
    return NextResponse.json({ error: "Enter a valid order number and email." }, { status: 400 });
  }

  const order = await getOrderById(orderId);

  if (!order || (order.email || "").toLowerCase() !== email) {
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
