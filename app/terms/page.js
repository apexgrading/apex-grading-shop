export const metadata = { title: "Terms & Conditions — Apex Cards" };

export default function TermsPage() {
  return (
    <div className="wrap" style={{ maxWidth: 760, padding: "56px 0 100px" }}>
      <p style={{ color: "var(--gold-light)", fontSize: 13.5, marginBottom: 10 }}>Legal</p>
      <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(28px,3vw,38px)", margin: "0 0 40px" }}>
        Terms &amp; Conditions
      </h1>

      <div style={{ color: "var(--grey)", fontSize: 15, lineHeight: 1.75 }}>
        <p style={{ marginBottom: 28 }}>
          These Terms &amp; Conditions govern purchases made on shopapexcards.com ("Apex Cards",
          "we", "us"). By placing an order, you ("the customer") confirm that you have read,
          understood and agree to these terms.
        </p>

        <Section title="1. Who we are">
          Apex Cards is a storefront selling trading and sports cards that have already been
          authenticated and graded, in-house, by Apex Grading Company. We are a sales channel for
          graded inventory — we don't accept cards from customers for grading here; that's handled
          separately by Apex Grading Company.
        </Section>

        <Section title="2. Every card is unique">
          Each listing on this site is a single, physical card. Once a card is purchased, it's
          removed from sale and we do not restock or sell multiple copies of the same listing.
        </Section>

        <Section title="3. Grading and condition">
          Where a card is listed as graded, its grade was assigned by Apex Grading Company
          according to their published ten-point scale, and reflects their professional opinion at
          the time of assessment — it is not a guarantee of future value. Where a card is listed as
          a raw, ungraded single, its condition is described to the best of our assessment but has
          not been independently graded or encapsulated.
        </Section>

        <Section title="4. Orders and payment">
          Payment is processed securely through Stripe, including Apple Pay where available. An
          order is confirmed once payment is successfully captured. We reserve the right to cancel
          and refund an order if a card becomes unavailable before shipment (for example, a data or
          timing error resulted in the same one-of-a-kind card being sold twice).
        </Section>

        <Section title="5. Shipping">
          Cards are shipped in protective packaging appropriate to their format (graded slab or raw
          single). Risk of loss passes to you once the order is handed to the carrier, unless
          required otherwise by law in your jurisdiction. Where we ship outside the United Kingdom,
          any customs duties, import taxes or handling fees are the responsibility of the recipient.
        </Section>

        <Section title="6. Returns">
          [Add your return policy here — e.g. time window, condition requirements for a return,
          who pays return shipping, and any exceptions for cards found to be inaccurately described.
          Placeholder — have a lawyer draft this to match your actual policy and local consumer law.]
        </Section>

        <Section title="7. Accounts">
          You're responsible for keeping your account credentials secure. Let us know immediately
          if you believe your account has been compromised.
        </Section>

        <Section title="8. Limitation of liability">
          [Standard liability limitation language — have a lawyer draft this for your jurisdiction.]
        </Section>

        <Section title="9. Changes to these terms">
          We may update these terms from time to time. The version in force at the time you place
          an order applies to that order.
        </Section>

        <Section title="10. Contact">
          Questions about these terms can be sent to{" "}
          <a href="mailto:hello@apexgradingcompany.com" style={{ color: "var(--gold-light)" }}>
            hello@apexgradingcompany.com
          </a>.
        </Section>

        <p style={{
          marginTop: 32, background: "var(--bg-panel)", border: "1px solid var(--line)",
          borderRadius: 6, padding: 16, fontSize: 13.5, color: "var(--gold-light)",
        }}>
          Placeholder text — have this reviewed by a lawyer before going live, particularly the
          Returns and Liability sections, which need your actual policy filled in.
        </p>
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
