import Link from "next/link";
import { getOrderBySessionId } from "../../lib/data";
import ClearCartOnMount from "../../components/ClearCartOnMount";

export default async function SuccessPage({ searchParams }) {
  const sessionId = searchParams?.session_id;
  const order = sessionId ? getOrderBySessionId(sessionId) : null;

  return (
    <div className="wrap" style={{ padding: "80px 0 100px", textAlign: "center" }}>
      <ClearCartOnMount />
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
              <span className="v">${(item.price / 100).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 40 }}>
        <Link href="/shop" className="btn btn-primary">Keep browsing</Link>
      </div>
    </div>
  );
}
