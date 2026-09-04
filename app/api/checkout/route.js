import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getAvailableCardsByIds, createPendingOrder, setOrderStripeSession } from "../../../lib/data";
import { stripe } from "../../../lib/stripe";

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const cardIds = body?.cardIds;

  if (!Array.isArray(cardIds) || cardIds.length === 0) {
    return NextResponse.json({ error: "cardIds must be a non-empty array" }, { status: 400 });
  }

  const ids = cardIds.map((id) => parseInt(id, 10));

  // Every card is a single unique unit — re-check availability against the DB,
  // never trust prices or availability sent from the client.
  const cards = getAvailableCardsByIds(ids);
  const foundIds = new Set(cards.map((c) => c.id));
  const unavailable = ids.filter((id) => !foundIds.has(id));

  if (unavailable.length > 0) {
    return NextResponse.json(
      { error: "Some cards in your cart are no longer available.", unavailableIds: unavailable },
      { status: 409 }
    );
  }

  const placeholder = `pending_${randomUUID()}`;
  const orderId = createPendingOrder(placeholder, cards);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    // Deliberately omitting payment_method_types: Checkout Sessions automatically
    // offer whatever's enabled in the Stripe Dashboard (card, Apple Pay, Google Pay,
    // etc.) without any extra parameter. Apple Pay additionally requires verifying
    // your domain: Dashboard → Settings → Payment methods → Apple Pay.
    line_items: cards.map((card) => ({
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: card.price,
        product_data: {
          name: card.title,
          description: `Grade ${card.grade} · Cert ${card.cert}`,
          images: card.imageUrl ? [`${siteUrl}${card.imageUrl}`] : undefined,
        },
      },
    })),
    metadata: { orderId: String(orderId) },
    success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/cart`,
  });

  setOrderStripeSession(orderId, session.id);

  return NextResponse.json({ url: session.url });
}
