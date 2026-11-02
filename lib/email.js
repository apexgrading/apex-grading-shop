import { logNotification } from "./data";

const DEFAULT_SENDER_NAME = "Shop APEX Cards";
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

// ---------- branded customer emails (Shop APEX Cards) ----------
const SITE = "https://www.shopapexcards.com";
const HELP = "hello@shopapexcards.com";
const GOLD = "#D4A73C";
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const money = (pence) => `£${((pence || 0) / 100).toFixed(2)}`;
const abs = (u) => (!u ? "" : /^https?:/.test(u) ? u : SITE + (u.startsWith("/") ? u : "/" + u));

function button(href, label) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center"><tr>
    <td align="center" bgcolor="${GOLD}" style="border-radius:6px;">
      <a href="${href}" target="_blank" style="display:inline-block;padding:15px 34px;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;color:#141200;text-decoration:none;border-radius:6px;">${label}</a>
    </td></tr></table>`;
}

function trustStrip() {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #2A2A2A;"><tr>
    <td align="center" style="padding:18px 8px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#A7A49A;line-height:1.8;">
      <span style="color:${GOLD};">&#10003;</span> Slabs graded in-house by Apex &nbsp;&middot;&nbsp; <span style="color:${GOLD};">&#10003;</span> Secure checkout with Stripe
    </td></tr></table>`;
}

/** Shared frame: logo header, gold rule, content card, socials + footer. */
function layout({ preheader, eyebrow, title, intro, cta, body = "", footnote = "" }) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark light"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:#0A0A0A;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#0A0A0A;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0A0A0A;"><tr><td align="center" style="padding:28px 14px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#141414;border:1px solid #2A2A2A;border-radius:14px;">
    <tr><td align="center" style="padding:28px 24px 22px;background:#000000;border-radius:14px 14px 0 0;">
      <a href="${SITE}" target="_blank"><img src="${SITE}/assets/shop-apex-cards-logo.jpg" width="280" alt="Shop APEX Cards" style="display:block;width:280px;max-width:100%;height:auto;border:0;"></a>
    </td></tr>
    <tr><td style="height:4px;background:${GOLD};font-size:0;line-height:0;">&nbsp;</td></tr>
    <tr><td style="padding:30px 32px 4px;font-family:Arial,Helvetica,sans-serif;">
      <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:${GOLD};font-weight:bold;">${eyebrow}</div>
      <h1 style="margin:10px 0 0;font-size:26px;line-height:1.25;color:#F5F3EE;font-weight:800;">${title}</h1>
      <p style="margin:14px 0 0;font-size:16px;line-height:1.6;color:#A7A49A;">${intro}</p>
    </td></tr>
    ${cta ? `<tr><td align="center" style="padding:26px 32px 6px;">${button(cta.href, cta.label)}</td></tr>` : ""}
    ${body}
    <tr><td style="padding:24px 32px 28px;">${trustStrip()}${footnote ? `<p style="margin:16px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#6E6B63;text-align:center;">${footnote}</p>` : ""}</td></tr>
  </table>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
    <tr><td align="center" style="padding:22px 20px 6px;font-family:Arial,Helvetica,sans-serif;font-size:13px;">
      <a href="https://www.instagram.com/shopapexcards/" style="color:${GOLD};text-decoration:none;font-weight:bold;margin:0 8px;">Instagram</a>
      <a href="https://www.tiktok.com/@shopapexcards" style="color:${GOLD};text-decoration:none;font-weight:bold;margin:0 8px;">TikTok</a>
      <a href="https://www.facebook.com/profile.php?id=61594206641360" style="color:${GOLD};text-decoration:none;font-weight:bold;margin:0 8px;">Facebook</a>
    </td></tr>
    <tr><td align="center" style="padding:6px 20px 8px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.7;color:#6E6B63;">
      <a href="${SITE}/shop" style="color:#A7A49A;text-decoration:none;">Slabs</a> &middot;
      <a href="${SITE}/mystery-slabs" style="color:#A7A49A;text-decoration:none;">Mystery Slabs</a> &middot;
      <a href="${SITE}/singles" style="color:#A7A49A;text-decoration:none;">Raw cards</a> &middot;
      <a href="${SITE}/sealed" style="color:#A7A49A;text-decoration:none;">Sealed</a> &middot;
      <a href="${SITE}/merch" style="color:#A7A49A;text-decoration:none;">Merch</a> &middot;
      <a href="${SITE}/track" style="color:#A7A49A;text-decoration:none;">Track an order</a><br>
      Questions? <a href="mailto:${HELP}" style="color:#A7A49A;">${HELP}</a><br>
      &copy; Shop APEX Cards &middot; Cards graded in-house by <a href="https://www.apexgradingcompany.com" style="color:#A7A49A;text-decoration:none;">Apex Grading Company</a>
    </td></tr>
  </table>
</td></tr></table></body></html>`;
}

function featureRows(rows) {
  return `<tr><td style="padding:26px 32px 0;font-family:Arial,Helvetica,sans-serif;">
    <div style="border-top:1px solid #2A2A2A;padding-top:22px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#6E6B63;font-weight:bold;">What's in store</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:6px;">
      ${rows.map(([icon, head, text, path]) => `<tr><td width="42" valign="top" style="padding:10px 0;font-size:22px;">${icon}</td>
        <td valign="top" style="padding:10px 0;"><a href="${SITE}${path}" target="_blank" style="font-size:15px;font-weight:bold;color:#F5F3EE;text-decoration:none;">${head} <span style="color:${GOLD};">&rsaquo;</span></a><div style="font-size:14px;line-height:1.5;color:#A7A49A;margin-top:3px;">${text}</div></td></tr>`).join("")}
    </table></td></tr>`;
}
const WHY = [
  ["&#127942;", "Apex graded slabs", "Graded in-house by Apex Grading Company, each with a cert number you can check online.", "/shop"],
  ["&#127873;", "Gem Mint 10 Mystery Slabs", "Pick a Mystery Slab and see what you pull.", "/mystery-slabs"],
  ["&#127183;", "Raw cards", "Singles for your binder, your deck or your next grading submission.", "/singles"],
  ["&#128230;", "ETBs &amp; booster boxes", "Sealed Elite Trainer Boxes, booster boxes and more.", "/sealed"],
  ["&#129506;", "Merch &amp; supplies", "Penny sleeves, top loaders, hoodies, caps and Apex merch.", "/merch"],
];

export function welcomeEmailHtml(email) {
  return layout({
    preheader: "You're on the list — slabs, raw cards, sealed, Mystery Slabs and merch, straight to your inbox.",
    eyebrow: "You're on the list",
    title: "Welcome to Shop APEX Cards",
    intro: `Thanks for signing up, <b style="color:#F5F3EE;">${esc(email)}</b>. You'll be first to hear about new slabs, raw cards, ETBs, booster boxes, Mystery Slabs and merch as they land.`,
    cta: { href: `${SITE}/shop`, label: "Shop now" },
    body: featureRows(WHY),
    footnote: `You're getting this because you signed up for Shop APEX Cards news. Don't want these emails? <a href="mailto:${HELP}?subject=Unsubscribe" style="color:#A7A49A;">Unsubscribe</a>.`,
  });
}

export function accountConfirmationHtml(email, subscribed) {
  return layout({
    preheader: "Your Shop APEX Cards account is ready — track orders and check out faster.",
    eyebrow: "Account created",
    title: "You're all set",
    intro: `Your Shop APEX Cards account for <b style="color:#F5F3EE;">${esc(email)}</b> is ready. Track every order, check out faster and keep a history of everything you've bought.${subscribed ? " You're also on our list for new drops." : ""}`,
    cta: { href: `${SITE}/shop`, label: "Start shopping" },
    body: featureRows(WHY),
    footnote: "Didn't create this account? You can ignore this email.",
  });
}

function itemsTable(items) {
  return items.map((i) => {
    const qty = i.quantity || 1, img = abs(i.card?.image);
    const grade = i.card?.grade ? `<span style="display:inline-block;margin-top:5px;padding:2px 8px;border:1px solid ${GOLD};border-radius:999px;font-size:11px;font-weight:bold;color:${GOLD};">Apex ${esc(i.card.grade)}${i.card.cert ? " &middot; " + esc(i.card.cert) : ""}</span>` : "";
    return `<tr>
      <td width="64" valign="top" style="padding:12px 12px 12px 0;">${img ? `<img src="${esc(img)}" width="56" alt="" style="display:block;width:56px;height:auto;border-radius:6px;border:1px solid #2A2A2A;">` : `<div style="width:56px;height:56px;line-height:56px;text-align:center;font-size:24px;border-radius:6px;background:#1E1E1E;">&#128717;</div>`}</td>
      <td valign="top" style="padding:12px 0;font-family:Arial,Helvetica,sans-serif;">
        <div style="font-size:14px;font-weight:bold;color:#F5F3EE;line-height:1.4;">${esc(i.card?.title || "Item")}</div>
        ${qty > 1 ? `<div style="font-size:13px;color:#A7A49A;margin-top:3px;">Qty ${qty}</div>` : ""}${grade}
      </td>
      <td valign="top" align="right" style="padding:12px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;color:#F5F3EE;white-space:nowrap;">${money(i.price * qty)}</td>
    </tr>`;
  }).join(`<tr><td colspan="3" style="border-top:1px solid #2A2A2A;font-size:0;line-height:0;">&nbsp;</td></tr>`);
}

function addressBlock(order) {
  const a = order.shippingAddress;
  if (!a && !order.shippingName) return "";
  const lines = [order.shippingName, a?.line1, a?.line2, a?.city, a?.state, a?.postal_code, a?.country].filter(Boolean).map(esc).join("<br>");
  return `<tr><td style="padding:18px 32px 0;font-family:Arial,Helvetica,sans-serif;">
    <div style="background:#1B1B1B;border:1px solid #2A2A2A;border-radius:10px;padding:14px 16px;">
      <div style="font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#6E6B63;font-weight:bold;">Delivering to</div>
      <div style="font-size:14px;line-height:1.6;color:#F5F3EE;margin-top:6px;">${lines}</div>
    </div></td></tr>`;
}

function orderSummary(order) {
  const sub = order.items.reduce((t, i) => t + i.price * (i.quantity || 1), 0);
  const ship = order.shippingCost || 0;
  return `<tr><td style="padding:24px 32px 0;font-family:Arial,Helvetica,sans-serif;">
    <div style="border-top:1px solid #2A2A2A;padding-top:18px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#6E6B63;font-weight:bold;">Order #${esc(order.id)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${itemsTable(order.items)}</table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #2A2A2A;margin-top:4px;font-size:14px;color:#A7A49A;">
      <tr><td style="padding:10px 0 2px;">Subtotal</td><td align="right" style="padding:10px 0 2px;">${money(sub)}</td></tr>
      <tr><td style="padding:2px 0;">Delivery</td><td align="right" style="padding:2px 0;">${order.shippingCost == null ? "—" : ship ? money(ship) : "Free"}</td></tr>
      <tr><td style="padding:8px 0 0;font-size:16px;font-weight:bold;color:#F5F3EE;">Total</td><td align="right" style="padding:8px 0 0;font-size:16px;font-weight:bold;color:${GOLD};">${money(sub + ship)}</td></tr>
    </table></td></tr>`;
}

export function orderConfirmationHtml(order) {
  return layout({
    preheader: `Order #${order.id} confirmed — we're getting it ready to post.`,
    eyebrow: `Order #${esc(order.id)} confirmed`,
    title: "Thanks for your order! &#127881;",
    intro: "We've got your payment and we're getting your order ready to post. We'll email you the tracking number as soon as it's on its way.",
    cta: { href: `${SITE}/track`, label: "Track my order" },
    body: orderSummary(order) + addressBlock(order) + `<tr><td style="padding:18px 32px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#A7A49A;">To track it, use order number <b style="color:#F5F3EE;">#${esc(order.id)}</b> and this email address. Anything wrong? Reply to this email or contact <a href="mailto:${HELP}" style="color:${GOLD};">${HELP}</a>.</td></tr>`,
  });
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
  const trackBox = order.trackingNumber ? `<tr><td style="padding:22px 32px 0;font-family:Arial,Helvetica,sans-serif;">
    <div style="background:#1B1B1B;border:1px solid ${GOLD};border-radius:10px;padding:16px 18px;text-align:center;">
      <div style="font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#6E6B63;font-weight:bold;">${esc(order.carrier || "Tracking")} tracking number</div>
      <div style="font-size:20px;font-weight:bold;color:#F5F3EE;margin-top:6px;letter-spacing:1px;">${esc(order.trackingNumber)}</div>
    </div></td></tr>` : "";
  return layout({
    preheader: `Order #${order.id} is on its way${order.carrier ? " with " + order.carrier : ""}.`,
    eyebrow: `Order #${esc(order.id)} shipped`,
    title: "Your order is on its way &#128666;",
    intro: `Good news — your order has been posted${order.carrier ? ` with <b style="color:#F5F3EE;">${esc(order.carrier)}</b>` : ""}. Keep an eye out for it!`,
    cta: url ? { href: url, label: "Track my parcel" } : { href: `${SITE}/track`, label: "Track my order" },
    body: trackBox + orderSummary(order) + addressBlock(order),
    footnote: `Tag us when it lands — <a href="https://www.instagram.com/shopapexcards/" style="color:#A7A49A;">@shopapexcards</a>. Questions? Reply to this email.`,
  });
}

export function adminNotificationHtml(title, details) {
  return `
    <div style="font-family: sans-serif; background:#0A0A0A; color:#F5F3EE; padding:32px;">
      <h1 style="color:#D4A73C; font-size:20px;">${title}</h1>
      <p style="color:#F5F3EE; font-size:15px;">${details}</p>
    </div>
  `;
}
