import { NextResponse } from "next/server";
import { markOrderPaid, getOrderBySessionId } from "../../../lib/data";
import { stripe } from "../../../lib/stripe";
import { sendEmail, orderConfirmationHtml } from "../../../lib/email";

export async function POST(request) {
  const sig = request.headers.get("stripe-signature");
  const rawBody = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = parseInt(session.metadata?.orderId, 10);
    const email = session.customer_details?.email;

    if (!Number.isNaN(orderId)) {
      markOrderPaid(orderId, email);

      if (email) {
        const order = getOrderBySessionId(session.id);
        if (order) {
          await sendEmail({
            to: email,
            subject: `Your Apex Grading order #${order.id} is confirmed`,
            html: orderConfirmationHtml(order),
            type: "order_confirmation",
            orderId: order.id,
          });
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
