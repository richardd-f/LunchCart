import NextAuth from "next-auth";
import { authConfig } from "./lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  // Protect /admin, /withdraw, and /manageAdmin routes - ADMIN only
  if (nextUrl.pathname.startsWith("/admin") ) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/auth/signin", nextUrl));
    }

    if (userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  // Protect /settings routes - logged in users only
  if (nextUrl.pathname.startsWith("/settings")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/auth/signin", nextUrl));
    }
    
    if (nextUrl.pathname === "/settings") {
      return NextResponse.redirect(new URL("/settings/user", nextUrl));
    }
  }

  // Protect /myOrders - logged in users only
  if (nextUrl.pathname.startsWith("/myOrders")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/auth/signin", nextUrl));
    }
  }

  // Protect /cart - logged in users only
  if (nextUrl.pathname.startsWith("/cart")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/auth/signin", nextUrl));
    }
  }

  // Protect /manageMenu - logged in users only (role check done in page/action)
  if (nextUrl.pathname.startsWith("/manageMenu")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/auth/signin", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/withdraw/:path*", "/manageAdmin/:path*", "/settings/:path*", "/myOrders/:path*", "/cart/:path*", "/manageMenu/:path*"],
};

