"use client";
// Gets a Cloudflare Turnstile "are you human" token before a form is sent.
// Most people never see anything; if Cloudflare is unsure it shows a small checkbox
// in the bottom corner. Forms add { botToken: await getBotToken() } to what they send.
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
let scriptPromise = null;

function loadScript() {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      s.async = true;
      s.onload = () => resolve(window.turnstile);
      s.onerror = () => { scriptPromise = null; reject(new Error("Couldn't load the human check")); };
      document.head.appendChild(s);
    });
  }
  return scriptPromise;
}

export async function getBotToken() {
  try { return await getTokenStrict(); } catch (e) { console.warn("[bot-check]", e && e.message); return null; }
}

async function getTokenStrict() {
  if (!SITE_KEY) return null;
  const ts = await loadScript();
  return new Promise((resolve, reject) => {
    const box = document.createElement("div");
    box.style.cssText = "position:fixed;right:16px;bottom:16px;z-index:9999";
    document.body.appendChild(box);
    const done = (fn, v) => { clearTimeout(t); try { ts.remove(id); } catch {} box.remove(); fn(v); };
    const t = setTimeout(() => done(reject, new Error("Human check took too long")), 15000);
    const id = ts.render(box, {
      sitekey: SITE_KEY,
      appearance: "interaction-only",
      callback: (token) => done(resolve, token),
      "error-callback": () => done(reject, new Error("Human check failed — please refresh and try again.")),
      "timeout-callback": () => done(reject, new Error("Human check timed out — please try again.")),
    });
  });
}
