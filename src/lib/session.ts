import { cookies } from "next/headers";
import { SESSION_COOKIE } from "./auth";
import { env } from "./env";

/** The access token from the session cookie, if any. Server-side only. */
export async function getToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

/** Stores a token issued by the API. Only callable from Server Actions and Route Handlers. */
export async function setToken(token: string, expiresAt: string) {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.siteUrl.startsWith("https://"),
    path: "/",
    expires: new Date(expiresAt),
  });
}

export async function clearToken() {
  (await cookies()).delete(SESSION_COOKIE);
}
