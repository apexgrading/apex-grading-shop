export const metadata = { title: "Terms & Conditions — Apex Grading Company" };

export default function TermsPage() {
  return (
    <div className="wrap" style={{ maxWidth: 760, padding: "56px 0 100px" }}>
      <p style={{ color: "var(--gold-light)", fontSize: 13.5, marginBottom: 10 }}>Legal</p>
      <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(28px,3vw,38px)", margin: "0 0 8px" }}>
        Terms &amp; Conditions
      </h1>
      <p style={{ color: "var(--grey-dim)", fontSize: 13.5, marginBottom: 40 }}>Last updated: placeholder — replace with your actual date</p>

      <div style={{ color: "var(--grey)", fontSize: 15, lineHeight: 1.75 }}>
        <p style={{
          background: "var(--bg-panel)", border: "1px solid var(--line)", borderRadius: 6,
          padding: 16, fontSize: 13.5, color: "var(--gold-light)", marginBottom: 32,
        }}>
          Placeholder text — have this reviewed by a lawyer before going live. It covers the basics
          a card-grading marketplace typically needs, but isn't a substitute for real legal advice.
        </p>

        <Section title="1. Who we are">
          Apex Grading Company ("Apex", "we", "us") grades and authenticates trading and sports
          cards, and sells graded cards directly through this website.
        </Section>

        <Section title="2. Every card is unique">
          Each listing on this site is a single, physically graded card. Once a card is purchased,
          it's removed from sale. We do not sell multiple copies of the same listing.
        </Section>

        <Section title="3. Grading">
          Grades are assigned according to the Apex ten-point scale, based on centering, corners,
          edges, and surface. Grading reflects our professional opinion at the time of assessment
          and is not a guarantee of future value.
        </Section>

        <Section title="4. Orders and payment">
          Payment is processed securely through Stripe, including Apple Pay where available. An
          order is confirmed once payment is successfully captured. We reserve the right to cancel
          and refund an order if a card becomes unavailable before shipment.
        </Section>

        <Section title="5. Shipping">
          Graded cards are shipped in protective packaging. Risk of loss passes to the buyer once
          the order is handed to the carrier, unless required otherwise by law in your jurisdiction.
        </Section>

        <Section title="6. Returns">
          [Add your return policy here — e.g. time window, condition requirements, who pays return
          shipping, and any exceptions for grading disputes.]
        </Section>

        <Section title="7. Accounts">
          You're responsible for keeping your account credentials secure. Let us know immediately
          if you believe your account has been compromised.
        </Section>

        <Section title="8. Limitation of liability">
          [Standard liability limitation language — have a lawyer draft this for your jurisdiction.]
        </Section>

        <Section title="9. Contact">
          Questions about these terms can be sent to [support email].
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{ fontSize: 17, fontWeight: 600, color: "var(--white)", marginBottom: 8 }}>{title}</h2>
      <p style={{ margin: 0 }}>{children}</p>
    </div>
  );
}
