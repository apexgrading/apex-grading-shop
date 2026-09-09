import { logNotification } from "./data";

const DEFAULT_SENDER_NAME = "Apex Cards";
const DEFAULT_SENDER_EMAIL = "hello@apexgradingcompany.com"; // verified sender in Brevo

/**
 * Sends a transactional email via Brevo's API and always logs it to the
 * `notifications` table, regardless of whether real delivery succeeded — so
 * there's a durable record of every customer notification even if the email
 * provider is down or not yet configured.
 *
 * To go live: set BREVO_API_KEY in .env (Brevo dashboard → SMTP & API → API Keys).
 * EMAIL_FROM_NAME / EMAIL_FROM_ADDRESS are optional overrides for the sender
 * shown to customers — must be a sender already verified in your Brevo account.
 */
export async function sendEmail({ to, subject, html, type = "generic", orderId = null }) {
  let sent = false;

  if (process.env.BREVO_API_KEY) {
    try {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          sender: {
            name: process.env.EMAIL_FROM_NAME || DEFAULT_SENDER_NAME,
            email: process.env.EMAIL_FROM_ADDRESS || DEFAULT_SENDER_EMAIL,
          },
          to: [{ email: to }],
          subject,
          htmlContent: html,
        }),
      });
      sent = res.ok;
      if (!res.ok) {
        console.error("Email send failed:", await res.text());
      }
    } catch (err) {
      console.error("Email send error:", err.message);
    }
  } else {
    console.log(`[email not configured — logged only] To: ${to} | Subject: ${subject}`);
  }

  logNotification({ email: to, type, subject, body: html, orderId, sent });
  return sent;
}

export function welcomeEmailHtml(email) {
  return `
    <div style="font-family: sans-serif; background:#0A0A0A; color:#F5F3EE; padding:32px;">
      <h1 style="color:#D4A73C;">Welcome to Apex Cards</h1>
      <p>You're on the list, ${email}. We'll let you know when new Gem-Mint cards hit the site.</p>
    </div>
  `;
}

export function accountConfirmationHtml(email, subscribed) {
  return `
    <div style="font-family: sans-serif; background:#0A0A0A; color:#F5F3EE; padding:32px;">
      <h1 style="color:#D4A73C;">You're signed up</h1>
      <p>Your Apex Cards account is ready — ${email}. You can now track orders and check out faster.</p>
      ${subscribed ? `<p>You're also on our list for new Gem-Mint listings — we'll email you when new cards hit the site.</p>` : ""}
      <p style="margin-top:24px; color:#A7A49A;">If you didn't create this account, you can ignore this email.</p>
    </div>
  `;
}

export function orderConfirmationHtml(order) {
  const rows = order.items
    .map(
      (i) => `<tr><td style="padding:8px 0;">${i.card.title}</td><td style="padding:8px 0; text-align:right;">$${(i.price / 100).toFixed(2)}</td></tr>`
    )
    .join("");
  return `
    <div style="font-family: sans-serif; background:#0A0A0A; color:#F5F3EE; padding:32px;">
      <h1 style="color:#D4A73C;">Order confirmed</h1>
      <p>Thanks for your order — here's what you got:</p>
      <table style="width:100%; border-collapse:collapse;">${rows}</table>
      <p style="margin-top:24px; color:#A7A49A;">Order #${order.id}</p>
    </div>
  `;
}
