import Link from "next/link";
import { getOrderBySessionId } from "../../lib/data";
import ClearCartOnMount from "../../components/ClearCartOnMount";
import PurchaseTracking from "../../components/PurchaseTracking";

export default async function SuccessPage({ searchParams }) {
  const sessionId = searchParams?.session_id;
  const order = sessionId ? await getOrderBySessionId(sessionId) : null;
  const isPaid = order && order.status === "paid";
  const purchaseValue = isPaid
    ? (order.items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0) + (order.shippingCost || 0)) / 100
    : null;

  return (
    <div className="wrap" style={{ padding: "80px 0 100px", textAlign: "center" }}>
      <ClearCartOnMount />
      {isPaid && (
        <PurchaseTracking
          orderId={order.id}
          value={purchaseValue}
          currency="GBP"
          items={order.items.map((item) => ({
            item_id: String(item.card.id),
            item_name: item.card.title,
            price: item.price / 100,
            quantity: item.quantity || 1,
          }))}
        />
      )}
      <p style={{ color: "var(--gold-light)", fontSize: 13.5, marginBottom: 14 }}>Order confirmed</p>
      <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(30px,3.4vw,44px)", margin: "0 0 18px" }}>
        Thanks — your cards are on their way.
      </h1>
      <p style={{ color: "var(--grey)", fontSize: 15.5, maxWidth: "50ch", margin: "0 auto 40px" }}>
        {order && order.status === "paid"
          ? "We've marked the payment as received and pulled these cards from the catalog."
          : "We've received your payment and are finalizing your order. This page updates once Stripe confirms it — usually within a few seconds."}
      </p>

      {order && (
        <div style={{ maxWidth: 480, margin: "0 auto", textAlign: "left", borderTop: "1px solid var(--line)" }}>
          {order.items.map((item) => (
            <div key={item.id} className="spec-row">
              <span className="k">{item.card.title}</span>
              <span className="v">£{(item.price / 100).toLocaleString()}</span>
            </div>
          ))}
          {order.shippingCost != null && (
            <div className="spec-row">
              <span className="k">Shipping</span>
              <span className="v">£{(order.shippingCost / 100).toLocaleString()}</span>
            </div>
          )}
          {order.shippingAddress && (
            <div className="spec-row">
              <span className="k">Shipping to</span>
              <span className="v">
                {order.shippingName}<br />
                {order.shippingAddress.line1}
                {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}<br />
                {order.shippingAddress.city} {order.shippingAddress.postal_code}
              </span>
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: 40 }}>
        <Link href="/shop" className="btn btn-primary">Keep browsing</Link>
      </div>
    </div>
  );
}
