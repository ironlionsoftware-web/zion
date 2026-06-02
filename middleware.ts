import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE } from "@/lib/admin/constants";
import { REGISTRATION_COOKIE } from "@/lib/registration/constants";
import type { RegisterNext } from "@/lib/registration/types";

const PROTECTED_PATHS: { path: string; next: RegisterNext }[] = [{ path: "/donation", next: "donation" }];

function isRegistered(request: NextRequest): boolean {
  const value = request.cookies.get(REGISTRATION_COOKIE)?.value;
  if (!value) return false;
  const [payload, signature] = value.split(".");
  return Boolean(payload && signature && payload.length > 8);
}

function isAdmin(request: NextRequest): boolean {
  const value = request.cookies.get(ADMIN_COOKIE)?.value;
  if (!value) return false;
  const [payload, signature] = value.split(".");
  return Boolean(payload && signature && signature.length > 8);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/admin/")) {
    if (pathname === "/api/admin/login") {
      return NextResponse.next();
    }
    if (!isAdmin(request)) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }
    if (!isAdmin(request)) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/checkout/")) {
    if (!isRegistered(request)) {
      return NextResponse.json(
        { error: "Please complete registration before checkout." },
        { status: 401 },
      );
    }
    return NextResponse.next();
  }

  const protectedRoute = PROTECTED_PATHS.find((r) => pathname === r.path);
  if (protectedRoute && !isRegistered(request)) {
    const url = request.nextUrl.clone();
    url.pathname = "/register";
    url.searchParams.set("next", protectedRoute.next);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/donation", "/api/checkout/:path*", "/admin", "/admin/:path*", "/api/admin/:path*"],
};
