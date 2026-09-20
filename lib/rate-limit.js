import { supabase, throwIfError } from "./data";

// Vercel serverless functions are stateless between invocations, so in-memory
// rate limiting doesn't work reliably - a request can land on a different
// instance each time. Tracking attempts in the database is what actually
// works across all instances.

export async function checkRateLimit(identifier, action, { maxAttempts = 5, windowMinutes = 15 } = {}) {
  const since = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();
  const { count, error } = await supabase
    .from("rate_limit_attempts")
    .select("*", { count: "exact", head: true })
    .eq("identifier", identifier)
    .eq("action", action)
    .gte("created_at", since);
  throwIfError(error, "checkRateLimit");
  return (count || 0) < maxAttempts;
}

export async function recordFailedAttempt(identifier, action) {
  const { error } = await supabase.from("rate_limit_attempts").insert({ identifier, action });
  throwIfError(error, "recordFailedAttempt");
}

export async function clearAttempts(identifier, action) {
  const { error } = await supabase.from("rate_limit_attempts").delete().eq("identifier", identifier).eq("action", action);
  throwIfError(error, "clearAttempts");
}

export function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}
