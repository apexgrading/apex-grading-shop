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
    const payload = JSON.stringify({
      sender: {
        name: process.env.EMAIL_FROM_NAME || DEFAULT_SENDER_NAME,
        email: process.env.EMAIL_FROM_ADDRESS || DEFAULT_SENDER_EMAIL,
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    });

    // Serverless functions occasionally reuse a stale pooled connection, which
    // fails with a low-level socket error on the first try — retry once with a
    // fresh connection before giving up.
    for (let attempt = 1; attempt <= 2 && !sent; attempt++) {
      try {
        const res = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "api-key": process.env.BREVO_API_KEY,
            "Content-Type": "application/json",
            Accept: "application/json",
            Connection: "close",
          },
          body: payload,
        });
        sent = res.ok;
        if (!res.ok) {
          console.error(`Email send failed (attempt ${attempt}):`, await res.text());
          break; // a real API rejection (bad key, blocked sender, etc.) won't fix itself on retry
        }
      } catch (err) {
        console.error(
          `Email send error (attempt ${attempt}):`,
          err.message,
          err.cause ? `| cause: ${err.cause}` : ""
        );
      }
    }
  } else {
    console.log(`[email not configured — logged only] To: ${to} | Subject: ${subject}`);
  }

  logNotification({ email: to, type, subject, body: html, orderId, sent });
  return sent;
}

export function welcomeEmailHtml(email) {
  const siteUrl = "https://www.shopapexcards.com";
  return `
    <div style="font-family: Arial, Helvetica, sans-serif; background:#0A0A0A; padding:32px 16px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; margin:0 auto; background:#141414; border:1px solid #2A2A2A; border-radius:10px; overflow:hidden;">

        <!-- Banner -->
        <tr>
          <td>
            <img src="${siteUrl}/assets/apex-cards-banner.jpg" alt="Apex Cards" width="560" style="display:block; width:100%; height:auto;">
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 32px;">
            <img src="${siteUrl}/assets/apex-cards-logo-circle-email.jpg" alt="Apex Cards" width="72" style="display:block; margin:0 auto 24px; border-radius:50%;">

            <h1 style="color:#F5F3EE; font-size:24px; font-weight:600; text-align:center; margin:0 0 12px;">
              Welcome to Apex Cards 🖤
            </h1>
            <p style="color:#A7A49A; font-size:14.5px; line-height:1.65; text-align:center; margin:0 0 28px;">
              You're officially on the list, ${email}. Every card we sell is authenticated and graded in-house by Apex Grading Company — Gem Mint 10 down to Poor 1, one of a kind, sold direct. We'll email you the moment new listings go live.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding-bottom:28px;">
                  <a href="${siteUrl}/shop" style="display:inline-block; background:#D4A73C; color:#141200; font-size:14.5px; font-weight:700; text-decoration:none; padding:14px 34px; border-radius:4px;">
                    Shop graded cards →
                  </a>
                </td>
              </tr>
            </table>

            <!-- Trust strip -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #2A2A2A; padding-top:20px;">
              <tr>
                <td style="color:#8A6E2C; font-size:12px; text-align:center;">
                  ✓ Graded in-house &nbsp;·&nbsp; ✓ Cert-verified &nbsp;·&nbsp; ✓ Secure checkout via Stripe
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Social -->
        <tr>
          <td style="background:#0A0A0A; padding:24px 32px; text-align:center; border-top:1px solid #2A2A2A;">
            <p style="color:#A7A49A; font-size:12.5px; margin:0 0 14px;">Follow along for new drops and restocks</p>
            <a href="https://www.instagram.com/shopapexcards/" style="display:inline-block; margin:0 8px; color:#D4A73C; text-decoration:none; font-size:13px; font-weight:600;">Instagram</a>
            <a href="https://www.tiktok.com/@shopapexcards" style="display:inline-block; margin:0 8px; color:#D4A73C; text-decoration:none; font-size:13px; font-weight:600;">TikTok</a>
            <a href="https://www.facebook.com/profile.php?id=61594206641360" style="display:inline-block; margin:0 8px; color:#D4A73C; text-decoration:none; font-size:13px; font-weight:600;">Facebook</a>
            <p style="color:#5A5850; font-size:11px; margin:18px 0 0;">© Apex Cards · Graded in-house by Apex Grading Company</p>
          </td>
        </tr>

      </table>
    </div>
  `;
}

export function accountConfirmationHtml(email, subscribed) {
  const siteUrl = "https://www.shopapexcards.com";
  return `
    <div style="font-family: Arial, Helvetica, sans-serif; background:#0A0A0A; padding:32px 16px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; margin:0 auto; background:#141414; border:1px solid #2A2A2A; border-radius:10px; overflow:hidden;">

        <!-- Banner -->
        <tr>
          <td>
            <img src="${siteUrl}/assets/apex-cards-banner.jpg" alt="Apex Cards" width="560" style="display:block; width:100%; height:auto;">
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 32px;">
            <img src="${siteUrl}/assets/apex-cards-logo-circle-email.jpg" alt="Apex Cards" width="72" style="display:block; margin:0 auto 24px; border-radius:50%;">

            <h1 style="color:#F5F3EE; font-size:24px; font-weight:600; text-align:center; margin:0 0 12px;">
              You're signed up 🖤
            </h1>
            <p style="color:#A7A49A; font-size:14.5px; line-height:1.65; text-align:center; margin:0 0 8px;">
              Your Apex Cards account is ready — <a href="mailto:${email}" style="color:#D4A73C; text-decoration:underline;">${email}</a>.
            </p>
            <p style="color:#A7A49A; font-size:14.5px; line-height:1.65; text-align:center; margin:0 0 28px;">
              Track every order, check out faster, and keep a full history of everything you've bought — all in one place.
              ${subscribed ? " You're also on our list for new Gem-Mint listings, straight to your inbox." : ""}
            </p>

            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding-bottom:28px;">
                  <a href="${siteUrl}/shop" style="display:inline-block; background:#D4A73C; color:#141200; font-size:14.5px; font-weight:700; text-decoration:none; padding:14px 34px; border-radius:4px;">
                    Shop graded cards →
                  </a>
                </td>
              </tr>
            </table>

            <!-- Trust strip -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #2A2A2A; padding-top:20px;">
              <tr>
                <td style="color:#8A6E2C; font-size:12px; text-align:center;">
                  ✓ Graded in-house &nbsp;·&nbsp; ✓ Cert-verified &nbsp;·&nbsp; ✓ Secure checkout via Stripe
                </td>
              </tr>
            </table>

            <p style="color:#5A5850; font-size:11.5px; text-align:center; margin:20px 0 0;">
              If you didn't create this account, you can safely ignore this email.
            </p>
          </td>
        </tr>

        <!-- Social -->
        <tr>
          <td style="background:#0A0A0A; padding:24px 32px; text-align:center; border-top:1px solid #2A2A2A;">
            <p style="color:#A7A49A; font-size:12.5px; margin:0 0 14px;">Follow along for new drops and restocks</p>
            <a href="https://www.instagram.com/shopapexcards/" style="display:inline-block; margin:0 8px; color:#D4A73C; text-decoration:none; font-size:13px; font-weight:600;">Instagram</a>
            <a href="https://www.tiktok.com/@shopapexcards" style="display:inline-block; margin:0 8px; color:#D4A73C; text-decoration:none; font-size:13px; font-weight:600;">TikTok</a>
            <a href="https://www.facebook.com/profile.php?id=61594206641360" style="display:inline-block; margin:0 8px; color:#D4A73C; text-decoration:none; font-size:13px; font-weight:600;">Facebook</a>
            <p style="color:#5A5850; font-size:11px; margin:18px 0 0;">© Apex Cards · Graded in-house by Apex Grading Company</p>
          </td>
        </tr>

      </table>
    </div>
  `;
}

export function orderConfirmationHtml(order) {
  const rows = order.items
    .map(
      (i) => `<tr><td style="padding:8px 0;">${i.card.title}</td><td style="padding:8px 0; text-align:right;">£${(i.price / 100).toFixed(2)}</td></tr>`
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

const CARRIER_TRACKING_URLS = {
  "Royal Mail": (t) => `https://www.royalmail.com/track-your-item#/tracking-results/${t}`,
  DPD: (t) => `https://track.dpd.co.uk/search?reference=${t}`,
  DHL: (t) => `https://www.dhl.com/gb-en/home/tracking.html?tracking-id=${t}`,
  UPS: (t) => `https://www.ups.com/track?tracknum=${t}`,
  FedEx: (t) => `https://www.fedex.com/fedextrack/?trknbr=${t}`,
  "Evri (Hermes)": (t) => `https://www.evri.com/track/parcel/${t}`,
};

export function trackingUrl(carrier, trackingNumber) {
  if (!carrier || !trackingNumber) return null;
  const builder = CARRIER_TRACKING_URLS[carrier];
  return builder ? builder(trackingNumber) : null;
}

export function orderShippedHtml(order) {
  const url = trackingUrl(order.carrier, order.trackingNumber);
  return `
    <div style="font-family: sans-serif; background:#0A0A0A; color:#F5F3EE; padding:32px;">
      <h1 style="color:#D4A73C;">Your order is on its way</h1>
      <p>Order #${order.id} has shipped${order.carrier ? ` via ${order.carrier}` : ""}.</p>
      ${order.trackingNumber
        ? `<p style="margin:16px 0;">Tracking number: <strong>${order.trackingNumber}</strong></p>
           ${url ? `<p><a href="${url}" style="color:#D4A73C;">Track your delivery →</a></p>` : ""}`
        : ""}
      <p style="margin-top:24px; color:#A7A49A;">Thanks for shopping with Apex Cards.</p>
    </div>
  `;
}
