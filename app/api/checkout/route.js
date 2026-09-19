import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createPendingOrder, setOrderStripeSession, getAvailableCardsWithQuantityCheck } from "../../../lib/data";
import { stripe } from "../../../lib/stripe";
import { getRegion, FREE_SHIPPING_THRESHOLD } from "../../../lib/shipping";

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const region = getRegion(body?.region);

  // Accepts either the newer { items: [{id, qty}] } shape (cart page, supports
  // buying multiple of the same stock item) or the older flat cardIds array
  // (Buy Now buttons, always qty 1 each) for backward compatibility.
  const idCounts = {};
  if (Array.isArray(body?.items)) {
    for (const it of body.items) {
      const id = parseInt(it.id, 10);
      const qty = Math.max(1, parseInt(it.qty, 10) || 1);
      if (!Number.isNaN(id)) idCounts[id] = (idCounts[id] || 0) + qty;
    }
  } else if (Array.isArray(body?.cardIds)) {
    for (const rawId of body.cardIds) {
      const id = parseInt(rawId, 10);
      if (!Number.isNaN(id)) idCounts[id] = (idCounts[id] || 0) + 1;
    }
  }

  if (Object.keys(idCounts).length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  // Every quantity is re-checked against real stock server-side — never trust
  // prices or availability sent from the client.
  const check = await getAvailableCardsWithQuantityCheck(idCounts);
  if (!check.ok) {
    return NextResponse.json(
      { error: "Some items in your cart are no longer available in the quantity requested.", unavailableIds: check.unavailableIds },
      { status: 409 }
    );
  }
  const cards = check.cards; // each has .requestedQty attached

  const placeholder = `pending_${randomUUID()}`;
  const orderId = await createPendingOrder(placeholder, cards);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const subtotal = cards.reduce((sum, c) => sum + c.price * c.requestedQty, 0);
  const qualifiesForFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const standardAmount = qualifiesForFreeShipping ? 0 : region.standard.amount;
  const standardLabel = qualifiesForFreeShipping
    ? `${region.standard.label} — FREE (order over £${(FREE_SHIPPING_THRESHOLD / 100).toFixed(0)})`
    : region.standard.label;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    // Deliberately omitting payment_method_types: Checkout Sessions automatically
    // offer whatever's enabled in the Stripe Dashboard (card, Apple Pay, Google Pay,
    // etc.) without any extra parameter. Apple Pay additionally requires verifying
    // your domain: Dashboard → Settings → Payment methods → Apple Pay.
    shipping_address_collection: {
      allowed_countries: region.countries,
    },
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: standardAmount, currency: "gbp" },
          display_name: standardLabel,
          delivery_estimate: {
            minimum: { unit: "business_day", value: region.standard.days[0] },
            maximum: { unit: "business_day", value: region.standard.days[1] },
          },
        },
      },
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: region.express.amount, currency: "gbp" },
          display_name: region.express.label,
          delivery_estimate: {
            minimum: { unit: "business_day", value: region.express.days[0] },
            maximum: { unit: "business_day", value: region.express.days[1] },
          },
        },
      },
    ],
    line_items: cards.map((card) => ({
      quantity: card.requestedQty,
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
