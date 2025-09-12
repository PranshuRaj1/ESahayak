
import { NextRequest, NextResponse } from "next/server";

export default async function middleware(req: NextRequest) {
  // determine login state by presence of Better Auth session cookie
  const sessionCookie =
    req.cookies.get("__Secure-better-auth.session_token") ??
    req.cookies.get("better-auth.session_token");
  const isLoggedIn = !!sessionCookie?.value;
  const { nextUrl } = req;

  const isAuthRoute = nextUrl.pathname === "/login" || nextUrl.pathname === "/register";

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/buyers", nextUrl));
  }

  if (!isLoggedIn && !isAuthRoute) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
}

// This config specifies which routes the middleware should run on.
export const config = {
  matcher: [
    // Exclude API, Next internals, and common static asset extensions in public/
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|txt|xml|json)).*)",
  ],
};