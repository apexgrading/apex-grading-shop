export const metadata = { title: "Privacy Policy — Apex Grading Company" };

export default function PrivacyPage() {
  return (
    <div className="wrap" style={{ maxWidth: 760, padding: "56px 0 100px" }}>
      <p style={{ color: "var(--gold-light)", fontSize: 13.5, marginBottom: 10 }}>Legal</p>
      <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(28px,3vw,38px)", margin: "0 0 8px" }}>
        Privacy Policy
      </h1>
      <p style={{ color: "var(--grey-dim)", fontSize: 13.5, marginBottom: 40 }}>Last updated: placeholder — replace with your actual date</p>

      <div style={{ color: "var(--grey)", fontSize: 15, lineHeight: 1.75 }}>
        <p style={{
          background: "var(--bg-panel)", border: "1px solid var(--line)", borderRadius: 6,
          padding: 16, fontSize: 13.5, color: "var(--gold-light)", marginBottom: 32,
        }}>
          Placeholder text — have this reviewed by a lawyer, particularly around GDPR/UK-GDPR if you
          have UK or EU customers, before going live.
        </p>

        <Section title="1. What we collect">
          <ul style={listStyle}>
            <li>Account details: email address and password (stored as a salted hash — we never
              store your actual password).</li>
            <li>Order details: items purchased, price, and shipping information.</li>
            <li>Newsletter signups: your email address, if you opt in.</li>
            <li>Payment details are collected and processed directly by Stripe — we never see or
              store your card number.</li>
          </ul>
        </Section>

        <Section title="2. How we use it">
          To process orders, send order and shipping confirmations, respond to support requests,
          and — only if you've opted in — send updates about new listings.
        </Section>

        <Section title="3. Who we share it with">
          Stripe, for payment processing. [Add any shipping carrier, email provider, or analytics
          tool you use.] We don't sell your data to third parties.
        </Section>

        <Section title="4. Cookies">
          We use a session cookie to keep you signed in, and your cart is stored in your browser's
          local storage. [Add details of any analytics/marketing cookies you introduce.]
        </Section>

        <Section title="5. Your rights">
          You can ask us to access, correct, or delete your personal data at any time by contacting
          [support email]. You can unsubscribe from marketing emails using the link in any email we
          send.
        </Section>

        <Section title="6. Contact">
          Questions about this policy can be sent to [support email].
        </Section>
      </div>
    </div>
  );
}

const listStyle = { margin: "0 0 0 20px", padding: 0 };

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{ fontSize: 17, fontWeight: 600, color: "var(--white)", marginBottom: 8 }}>{title}</h2>
      <div>{children}</div>
    </div>
  );
}
