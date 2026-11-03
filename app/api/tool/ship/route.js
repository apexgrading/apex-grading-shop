import { NextResponse } from "next/server";
import { markOrderShipped, getOrderById } from "../../../../lib/data";
import { sendEmail, orderShippedHtml } from "../../../../lib/email";

// Mark a shop order shipped from the Apex grading tool (QC & Ship / Shop tab).
// The tool sends the staff member's own grading-tool sign-in; we check it with the same
// am_i_staff check the tool uses, then do exactly what the shop admin's Ship button does:
// save carrier + tracking and email the customer their "on its way" email.
export const dynamic = "force-dynamic";

async function isToolStaff(request) {
  const auth = request.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!token || !process.env.SUPABASE_URL) return false;
  try {
    const r = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/am_i_staff`, {
      method: "POST",
      headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: "{}",
      cache: "no-store",
    });
    return r.ok && (await r.json()) === true;
  } catch {
    return false;
  }
}

export async function POST(request) {
  if (!(await isToolStaff(request))) {
    return NextResponse.json({ error: "Please sign in to the Apex grading tool again." }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const orderId = parseInt(body?.orderId, 10);
  const carrier = body?.carrier?.toString().trim().slice(0, 60);
  const trackingNumber = body?.trackingNumber?.toString().trim().slice(0, 80);
  if (Number.isNaN(orderId)) return NextResponse.json({ error: "Invalid order." }, { status: 400 });
  if (!carrier || !trackingNumber) return NextResponse.json({ error: "Carrier and tracking number are required." }, { status: 400 });

  const before = await getOrderById(orderId);
  if (!before) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  if (before.status !== "paid" && before.status !== "shipped") {
    return NextResponse.json({ error: "That order hasn't been paid." }, { status: 400 });
  }

  await markOrderShipped(orderId, { carrier, trackingNumber });
  const order = await getOrderById(orderId);
  let emailed = false;
  if (order?.email && body?.notify !== false) {
    await sendEmail({
      to: order.email,
      subject: `Your order #${order.id} is on its way — Shop APEX Cards`,
      html: orderShippedHtml(order),
      type: "order_shipped",
      orderId: order.id,
    });
    emailed = true;
  }
  return NextResponse.json({ ok: true, emailed, orderId });
}
