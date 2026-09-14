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
          <p style={{ margin: "0 0 12px" }}>
            If you're a UK or EU consumer, you have a legal right to cancel your order within 14
            days of receiving it, without giving a reason, under the Consumer Contracts
            Regulations 2013. To cancel, email us at{" "}
            <a href="mailto:hello@apexgradingcompany.com" style={{ color: "var(--gold-light)" }}>hello@apexgradingcompany.com</a>{" "}
            within 14 days of delivery, then return the item to us within a further 14 days.
          </p>
          <p style={{ margin: "0 0 12px" }}>
            The card must be returned in the same condition it was sent — for graded cards, in
            its original sealed slab with the certification label intact; for raw singles, in the
            same condition described at sale. We may make a deduction from your refund if the
            item's value has been reduced by handling beyond what's needed to check it (for
            example, a cracked or opened slab).
          </p>
          <p style={{ margin: "0 0 12px" }}>
            You're responsible for return postage unless the card arrived faulty, damaged in
            transit, or materially different from how it was described — in those cases, we'll
            cover return shipping and refund your original delivery cost too.
          </p>
          <p style={{ margin: 0 }}>
            Refunds are issued to your original payment method within 14 days of us receiving the
            returned item. This is in addition to, and doesn't affect, your other statutory rights
            — for example under the Consumer Rights Act 2015 if a card is faulty or not as
            described. If you're ordering from outside the UK/EU, local consumer protection laws
            may differ; contact us and we'll always try to resolve a genuine issue fairly.
          </p>
        </Section>

        <Section title="7. Accounts">
          You're responsible for keeping your account credentials secure. Let us know immediately
          if you believe your account has been compromised.
        </Section>

        <Section title="8. Limitation of liability">
          <p style={{ margin: "0 0 12px" }}>
            To the fullest extent permitted by law, our liability to you for any claim arising
            from your order — whether in contract, negligence, or otherwise — is limited to the
            amount you paid for the affected item(s). We aren't liable for indirect or
            consequential losses, such as loss of profit or opportunity.
          </p>
          <p style={{ margin: 0 }}>
            Nothing in these terms excludes or limits liability that cannot be excluded under
            applicable law, including liability for death or personal injury caused by negligence,
            or for fraud. A card's grade reflects Apex Grading Company's professional opinion at
            the time of assessment and is not a guarantee of future market value.
          </p>
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
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{ fontSize: 17, fontWeight: 600, color: "var(--white)", marginBottom: 8 }}>{title}</h2>
      <div style={{ margin: 0 }}>{children}</div>
    </div>
  );
}
