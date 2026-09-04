import Link from "next/link";

export default function CancelPage() {
  return (
    <div className="wrap" style={{ padding: "80px 0 100px", textAlign: "center" }}>
      <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(30px,3.4vw,44px)", margin: "0 0 18px" }}>
        Checkout cancelled
      </h1>
      <p style={{ color: "var(--grey)", fontSize: 15.5, maxWidth: "46ch", margin: "0 auto 40px" }}>
        Nothing was charged, and your cart is still saved.
      </p>
      <Link href="/cart" className="btn btn-primary">Back to cart</Link>
    </div>
  );
}
