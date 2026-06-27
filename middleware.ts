import { auth } from "@/lib/auth/config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/", "/login", "/register", "/forgot-password", "/verify-email"];
const authRoutes = ["/login", "/register", "/forgot-password"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // API routes - no redirect
  if (pathname.startsWith("/api")) return NextResponse.next();

  // Static files
  if (pathname.startsWith("/_next") || pathname.startsWith("/images") || pathname.includes(".")) {
    return NextResponse.next();
  }

  // If logged in and trying to access auth routes, redirect to chat
  if (isLoggedIn && authRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/chat", req.url));
  }

  // Protected routes
  if (
    !isLoggedIn &&
    !publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))
  ) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
