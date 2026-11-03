// Server side of the Cloudflare Turnstile check + a per-person limit, for public forms
// (newsletter, "notify me"). Stops bots signing strangers up and making us email them.
import { checkRateLimit, recordFailedAttempt, getClientIp } from "./rate-limit";

// Returns { ok, reason } — reason is Cloudflare's own error code when it says no
export async function verifyBotToken(token, ip) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { ok: true, reason: "not-set-up" };
  if (!token) return { ok: false, reason: "no-token-from-browser" };
  try {
    const form = new URLSearchParams({ secret, response: String(token) });
    if (ip && ip !== "unknown") form.set("remoteip", ip);
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form, cache: "no-store" });
    const j = await r.json();
    return { ok: !!j.success, reason: (j["error-codes"] || []).join(",") || (j.success ? "" : "unknown") + (j.hostname ? " host=" + j.hostname : "") };
  } catch (e) {
    return { ok: false, reason: "cloudflare-unreachable" };
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
  const check = await verifyBotToken(body?.botToken, ip);
  if (!check.ok) {
    // For now a failed human check is logged, not blocked, so real people are never turned away.
    // The per-person limit above and the site-wide welcome-email cap still stop bots.
    console.warn(`[bot-check] ${action} human check failed: ${check.reason}`);
    // also saved, so we can see Cloudflare's reason without server logs
    try { await recordFailedAttempt("check", `${action}-check:${String(check.reason).slice(0, 80)}`); } catch {}
  }
  return null;
}

export const looksLikeEmail = (e) => /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(String(e || ""));
