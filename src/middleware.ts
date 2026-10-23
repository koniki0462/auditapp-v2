import { NextResponse, type NextRequest } from "next/server";
import { isTokenUsable, PUBLIC_PATHS, SESSION_COOKIE } from "@/lib/auth";

/**
 * Sends visitors without a usable session to /login, remembering where they were going. This is only a
 * convenience: the API checks the token on every request, and a 401 from it also lands on /login.
 */
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const usable = isTokenUsable(token);

  if (PUBLIC_PATHS.includes(pathname) || usable) {
    const response = NextResponse.next();
    if (token && !usable) response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  const login = new URL("/login", request.url);
  if (pathname !== "/") login.searchParams.set("next", pathname + search);
  const response = NextResponse.redirect(login);
  if (token) response.cookies.delete(SESSION_COOKIE);
  return response;
}

export const config = {
  // Everything except Next's assets and files with an extension (favicon, images).
  matcher: ["/((?!_next/static|_next/image|.*\\.[\\w]+$).*)"],
};
