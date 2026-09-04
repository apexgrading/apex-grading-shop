export const metadata = { title: "Privacy Policy — Apex Grading Company" };

export default function PrivacyPage() {
  return (
    <div className="wrap" style={{ maxWidth: 760, padding: "56px 0 100px" }}>
      <p style={{ color: "var(--gold-light)", fontSize: 13.5, marginBottom: 10 }}>Legal</p>
      <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(28px,3vw,38px)", margin: "0 0 40px" }}>
        Privacy Policy
      </h1>

      <div style={{ color: "var(--grey)", fontSize: 15, lineHeight: 1.75 }}>
        <p style={{ marginBottom: 28 }}>
          Apex Grading Company ("we", "us", "our") is committed to protecting your privacy. This
          policy explains what personal information we collect when you use our website and grading
          services, how we use it, and the rights you have over it.
        </p>

        <Section title="Information we collect">
          We collect information you provide when you create an account or submit items — your
          name, email address, postal address and telephone number — along with details of the
          items you submit, including their declared values. When you pay, your card details are
          entered directly with our payment processor; we do not see or store your full card number.
        </Section>

        <Section title="How we use your information">
          We use your information to process and return your submissions, authenticate and grade
          your items, communicate with you about the status of your order, take payment, and meet
          our legal and accounting obligations. Our lawful bases for processing are the performance
          of our contract with you, our legitimate business interests, compliance with legal
          obligations, and, where required, your consent.
        </Section>

        <Section title="Who we share it with">
          We share information only as needed to provide the service: with our payment processor to
          take payment, with delivery couriers to return your items, and with the email provider
          that sends your order updates. We do not sell your personal information.
        </Section>

        <Section title="Cookies">
          Our website uses cookies that are strictly necessary for the site to function, such as
          keeping you logged in. Any non-essential cookies are used only where permitted.
        </Section>

        <Section title="Retention">
          We keep your personal information for as long as your account is active and for as long
          afterwards as we are required to for legal, tax and record-keeping purposes.
        </Section>

        <Section title="Your rights">
          You have the right to access, correct, erase, restrict or object to our processing of your
          personal information, and to request a copy of it. To exercise any of these rights,
          contact us at{" "}
          <a href="mailto:info@apexgradingcompany.com" style={{ color: "var(--gold-light)" }}>
            info@apexgradingcompany.com
          </a>. If you are in the UK, you also have the right to complain to the Information
          Commissioner's Office (ICO).
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
