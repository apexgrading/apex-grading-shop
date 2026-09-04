import { logNotification } from "./data";

/**
 * Sends a transactional email and always logs it to the `notifications` table,
 * regardless of whether real delivery succeeded — so there's a durable record of
 * every customer notification even if the email provider is down or not yet
 * configured.
 *
 * To go live: set RESEND_API_KEY in .env (https://resend.com — a simple,
 * fetch-based transactional email API with no SDK/native deps required).
 * Swap in a different provider by editing the fetch call below.
 */
export async function sendEmail({ to, subject, html, type = "generic", orderId = null }) {
  let sent = false;

  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || "Apex Cards <orders@apexgradingcompany.com>",
          to,
          subject,
          html,
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
