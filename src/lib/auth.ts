// Pure session helpers, safe to import from middleware (Edge runtime), server code and tests.

/** httpOnly cookie holding the audit-service access token (a JWT). The browser never reads it. */
export const SESSION_COOKIE = "auditapp_session";

/** Routes that work without signing in. */
export const PUBLIC_PATHS = ["/login", "/signup"];

/**
 * Reads the `exp` claim (seconds) from a JWT without verifying it. Only used to skip obviously expired
 * cookies; the API verifies every token. Returns null if the token can't be parsed.
 */
export function tokenExpiry(token: string): number | null {
  const payload = token.split(".")[1];
  if (!payload) return null;
  try {
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const exp = (JSON.parse(json) as { exp?: unknown }).exp;
    return typeof exp === "number" ? exp : null;
  } catch {
    return null;
  }
}

export function isTokenUsable(token: string | undefined, nowMs = Date.now()): token is string {
  if (!token) return false;
  const exp = tokenExpiry(token);
  return exp !== null && exp * 1000 > nowMs;
}

/** Only allows same-site paths after login, so ?next= can't redirect to another site. */
export function safeNextPath(next: unknown): string {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\")
    ? next
    : "/";
}
