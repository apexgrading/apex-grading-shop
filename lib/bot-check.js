// Server side of the Cloudflare Turnstile check + a per-person limit, for public forms
// (newsletter, "notify me"). Stops bots signing strangers up and making us email them.
import { checkRateLimit, recordFailedAttempt, getClientIp } from "./rate-limit";

export async function verifyBotToken(token, ip) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // not set up — the per-person limit still applies
  if (!token) return false;
  try {
    const form = new URLSearchParams({ secret, response: String(token) });
    if (ip && ip !== "unknown") form.set("remoteip", ip);
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form, cache: "no-store" });
    const j = await r.json();
    return !!j.success;
  } catch {
    return false;
  }
}

// Returns null when the request may go ahead, or { error, status } to send back.
export async function guardPublicForm(request, body, action, { perHour = 5 } = {}) {
  const ip = getClientIp(request);
  if (body?.website) return { error: "Something went wrong.", status: 400 }; // hidden field only bots fill in
  if (!(await checkRateLimit(ip, action, { maxAttempts: perHour, windowMinutes: 60 }))) {
    return { error: "Too many tries — please wait a while and try again.", status: 429 };
  }
  await recordFailedAttempt(ip, action); // counts every attempt
  if (!(await verifyBotToken(body?.botToken, ip))) {
    return { error: "We couldn't check you're human — please refresh the page and try again.", status: 403 };
  }
  return null;
}

export const looksLikeEmail = (e) => /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(String(e || ""));
