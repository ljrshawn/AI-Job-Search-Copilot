import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export const middleware = withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // If on login page and authenticated, redirect to dashboard
    if (pathname === "/login" && token) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // If on root path and authenticated, redirect to dashboard
    if (pathname === "/" && token) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // If on root path and not authenticated, redirect to login
    if (pathname === "/" && !token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Allow unauthenticated access to /login
        // Require auth for other routes except root (handled separately)
        return true;
      },
    },
  },
);

export const config = {
  matcher: ["/", "/dashboard/:path*", "/login"],
};
