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
  const cards = await getAvailableCardsByIds(ids);
  const foundIds = new Set(cards.map((c) => c.id));
  const unavailable = ids.filter((id) => !foundIds.has(id));

  if (unavailable.length > 0) {
    return NextResponse.json(
      { error: "Some cards in your cart are no longer available.", unavailableIds: unavailable },
      { status: 409 }
    );
  }

  const placeholder = `pending_${randomUUID()}`;
  const orderId = await createPendingOrder(placeholder, cards);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    // Deliberately omitting payment_method_types: Checkout Sessions automatically
    // offer whatever's enabled in the Stripe Dashboard (card, Apple Pay, Google Pay,
    // etc.) without any extra parameter. Apple Pay additionally requires verifying
    // your domain: Dashboard → Settings → Payment methods → Apple Pay.
    shipping_address_collection: {
      allowed_countries: ["GB", "IE", "US", "CA", "AU", "NZ", "FR", "DE", "ES", "IT", "NL"],
    },
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: 399, currency: "gbp" },
          display_name: "Standard tracked (3–5 days)",
          delivery_estimate: {
            minimum: { unit: "business_day", value: 3 },
            maximum: { unit: "business_day", value: 5 },
          },
        },
      },
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: 799, currency: "gbp" },
          display_name: "Express tracked (1–2 days)",
          delivery_estimate: {
            minimum: { unit: "business_day", value: 1 },
            maximum: { unit: "business_day", value: 2 },
          },
        },
      },
    ],
    line_items: cards.map((card) => ({
      quantity: 1,
      price_data: {
        currency: "gbp",
        unit_amount: card.price,
        product_data: {
          name: card.title,
          description: card.isGraded ? `Grade ${card.grade} · Cert ${card.cert}` : `Raw single · ${card.condition}`,
          images: card.imageUrl ? [`${siteUrl}${card.imageUrl}`] : undefined,
        },
      },
    })),
    metadata: { orderId: String(orderId) },
    success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/cart`,
  });

  await setOrderStripeSession(orderId, session.id);

  return NextResponse.json({ url: session.url });
}
