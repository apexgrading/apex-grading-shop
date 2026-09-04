import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return { salt, hash };
}

export function verifyPassword(password, salt, hash) {
  const candidate = scryptSync(password, salt, 64);
  const stored = Buffer.from(hash, "hex");
  if (candidate.length !== stored.length) return false;
  return timingSafeEqual(candidate, stored);
}

export function newSessionToken() {
  return randomBytes(32).toString("hex");
}

export const SESSION_COOKIE = "apex_session";
export const SESSION_DAYS = 30;

export function sessionExpiry() {
  const d = new Date();
  d.setDate(d.getDate() + SESSION_DAYS);
  return d.toISOString();
}
