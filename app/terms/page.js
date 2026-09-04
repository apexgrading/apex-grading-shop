export const metadata = { title: "Terms & Conditions — Apex Grading Company" };

export default function TermsPage() {
  return (
    <div className="wrap" style={{ maxWidth: 760, padding: "56px 0 100px" }}>
      <p style={{ color: "var(--gold-light)", fontSize: 13.5, marginBottom: 10 }}>Legal</p>
      <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(28px,3vw,38px)", margin: "0 0 40px" }}>
        Terms &amp; Conditions
      </h1>

      <div style={{ color: "var(--grey)", fontSize: 15, lineHeight: 1.75 }}>
        <p style={{ marginBottom: 28 }}>
          These Terms &amp; Conditions govern the submission of cards and graded holders
          ("items") to Apex Grading Company for authentication, grading, reholder and review
          services. By submitting an item, you ("the submitter") confirm that you have read,
          understood and agree to these terms.
        </p>

        <Section title="1. Submission & ownership">
          You confirm that you are the lawful owner of each item submitted, or that you are
          authorised by the owner to submit it. You are responsible for the accuracy of the
          information you provide about each item, including its identification and declared value.
        </Section>

        <Section title="2. No alterations">
          You agree not to knowingly submit any item that has been trimmed, recoloured, restored,
          cleaned, re-glossed or otherwise altered, nor any item that has been fraudulently
          encapsulated. Where our examination finds evidence of such alteration, we will not
          authenticate or grade the item, and it may be returned ungraded.
        </Section>

        <Section title="3. Tampered or damaged holders">
          Items sent for reholder or review services must arrive in a sealed, undamaged holder.
          Any holder that arrives open, cracked, unsealed or otherwise tampered with will be treated
          as a new submission and re-examined from the beginning. We cannot guarantee the
          authenticity or grade of an item removed from, or supplied outside of, its original sealed
          holder, and such items may be rejected.
        </Section>

        <Section title="4. Right to refuse">
          We reserve the absolute right to decline to authenticate, grade or encapsulate any item —
          including, without limitation, items we reasonably believe to be counterfeit, altered,
          structurally compromised or too fragile to process safely. Where we decline an item, we
          will notify you and return it in the condition received, subject to our Shipping Policy.
        </Section>

        <Section title="5. Fraudulent, altered & counterfeit items">
          We strictly prohibit the submission of fraudulent, altered or counterfeit items. If an
          item is determined during examination to be counterfeit or to have been tampered with, we
          will not authenticate or grade it. The submitter remains fully liable for any item
          knowingly submitted in breach of these terms, and we may withhold such an item where
          required to do so by law or by the rights holder.
        </Section>

        <Section title="6. Authenticity & grade claims">
          If you believe an item we have graded is not authentic, or has been graded incorrectly,
          you may submit it to us for review under our Return &amp; Corrections Policy. Where a
          claim is upheld, we will contact you regarding the appropriate next steps. Where a claim
          is not upheld — that is, the item is confirmed genuine and correctly graded — the item
          will be returned to you, and any applicable review fee and return postage will be payable
          by you. Review fees, where they apply, are set out at the point of submission.
        </Section>

        <Section title="7. Liability">
          Return postage and insurance are charged in accordance with the shipping options selected
          at submission. Our liability for any item is limited to the extent set out in these terms
          and in any separate service agreement. Nothing in these terms limits liability that cannot
          be limited under applicable law.
        </Section>

        <Section title="8. Changes to these terms">
          We may update these terms from time to time. The version in force at the time of your
          submission applies to that submission.
        </Section>

        <Section title="Shipping Policy">
          <p style={{ margin: "0 0 14px" }}>
            You are responsible for packaging your items securely and for the cost and risk of
            delivering them to us. We strongly recommend a fully tracked and insured service. Items
            remain at your risk in transit until they are received and checked in at our facility.
          </p>
          <p style={{ margin: "0 0 14px" }}>
            Once your order is complete, we return your items using Royal Mail Special Delivery,
            which is tracked and insured. Return postage and insurance are charged according to the
            shipping option selected at submission and shown on your order. We ship to the delivery
            address on your account or order — it's your responsibility to make sure this is correct
            and complete before dispatch.
          </p>
          <p style={{ margin: "0 0 14px" }}>
            Items are dispatched after grading is complete and your order has been finalised.
            Delivery times then depend on the courier and are outside our control. Where we ship
            outside the United Kingdom, any customs duties, import taxes or handling fees are the
            responsibility of the recipient.
          </p>
          <p style={{ margin: 0 }}>
            If a returned item is lost or damaged in transit, contact us promptly so we can help
            pursue a claim with the courier under the insured value.
          </p>
        </Section>

        <Section title="Return & Corrections Policy">
          <p style={{ margin: "0 0 14px" }}>
            Grading is an expert opinion based on our published standards. Once a grade has been
            assigned it is final, save for the correction and review routes set out below.
          </p>
          <p style={{ margin: "0 0 14px" }}>
            If a label contains a clerical error we have made — for example a misspelled name, an
            incorrect card number or a wrong set — we will correct it at no charge. Contact us with
            your certificate number and we will arrange the correction.
          </p>
          <p style={{ margin: "0 0 14px" }}>
            If you believe an item has been graded incorrectly or is not authentic, you may return
            it to us for review. We will re-examine the item against our standards. If the review is
            upheld we will advise on next steps; if the item is confirmed genuine and correctly
            graded, it is returned to you and any applicable review fee and return postage are
            payable by you.
          </p>
          <p style={{ margin: "0 0 14px" }}>
            If a holder arrives damaged, or is damaged in return transit, contact us so we can
            arrange a reholder. Grading fees pay for the expert work carried out on your submission
            and are generally non-refundable once that work has begun. Where we decline an item
            before grading has taken place, we will discuss the appropriate options with you.
          </p>
          <p style={{ margin: 0 }}>
            To request a correction or review, contact us with your certificate number and a
            description of the issue.
          </p>
        </Section>

        <p style={{ marginTop: 32, fontSize: 14 }}>
          Questions about these terms can be sent to{" "}
          <a href="mailto:info@apexgradingcompany.com" style={{ color: "var(--gold-light)" }}>
            info@apexgradingcompany.com
          </a>.
        </p>
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
