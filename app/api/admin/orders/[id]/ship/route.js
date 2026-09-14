import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { markOrderShipped, getOrderById, isValidAdminSession } from "../../../../../../lib/data";
import { sendEmail, orderShippedHtml } from "../../../../../../lib/email";

async function requireAdmin() {
  const token = cookies().get("apex_admin")?.value;
  return isValidAdminSession(token);
}

export async function POST(request, { params }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const orderId = parseInt(params.id, 10);
  if (Number.isNaN(orderId)) {
    return NextResponse.json({ error: "Invalid order id." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const carrier = body?.carrier?.toString().trim();
  const trackingNumber = body?.trackingNumber?.toString().trim();

  if (!carrier || !trackingNumber) {
    return NextResponse.json({ error: "Carrier and tracking number are required." }, { status: 400 });
  }

  await markOrderShipped(orderId, { carrier, trackingNumber });

  const order = await getOrderById(orderId);
  if (order?.email) {
    await sendEmail({
      to: order.email,
      subject: `Your Apex Cards order #${order.id} has shipped`,
      html: orderShippedHtml(order),
      type: "order_shipped",
      orderId: order.id,
    });
  }

  return NextResponse.json({ order });
}
