import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE } from "@/lib/admin/constants";
import { hasValidAdminCookie, hasValidRegistrationCookie } from "@/lib/auth/edge-cookies";
import { buildRegisterPath } from "@/lib/registration/register-path";
import { REGISTRATION_COOKIE } from "@/lib/registration/constants";

/**
 * These verify the cookie's HMAC, not just its shape.
 *
 * They previously checked only that the value looked like `payload.signature` with a segment
 * longer than eight characters, so any forged string got past the proxy. Nothing was exploitable,
 * because every admin route and page re-checks properly one layer in — but it meant a single new
 * route trusting the proxy would have turned into a full authentication bypass. Real verification
 * here costs microseconds and removes that trap.
 */
function isRegistered(request: NextRequest): Promise<boolean> {
  return hasValidRegistrationCookie(request.cookies.get(REGISTRATION_COOKIE)?.value);
}

function isAdmin(request: NextRequest): Promise<boolean> {
  return hasValidAdminCookie(request.cookies.get(ADMIN_COOKIE)?.value);
}

function redirectToRegister(request: NextRequest, options: Parameters<typeof buildRegisterPath>[0]): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = "/register";
  url.search = buildRegisterPath(options).split("?")[1] ?? "";
  return NextResponse.redirect(url);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/admin/")) {
    if (pathname === "/api/admin/login") {
      return NextResponse.next();
    }
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }
    if (!(await isAdmin(request))) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/checkout/")) {
    if (!(await isRegistered(request))) {
      return NextResponse.json(
        { error: "Please complete registration before checkout.", code: "registration_required" },
        { status: 401 },
      );
    }
    return NextResponse.next();
  }

  if (!(await isRegistered(request))) {
    if (pathname === "/donation") {
      return redirectToRegister(request, { next: "donation" });
    }

    if (pathname === "/shop/checkout") {
      return redirectToRegister(request, { next: "checkout" });
    }

    if (pathname === "/checkout/service") {
      const service = request.nextUrl.searchParams.get("service")?.trim();
      return redirectToRegister(request, {
        next: "book",
        service: service || undefined,
        practitioner: request.nextUrl.searchParams.get("practitioner") ?? undefined,
        ceremony: request.nextUrl.searchParams.get("ceremony") ?? undefined,
        addon: request.nextUrl.searchParams.get("addon") ?? undefined,
        session: request.nextUrl.searchParams.get("session") ?? undefined,
        format: request.nextUrl.searchParams.get("format") ?? undefined,
        group: request.nextUrl.searchParams.get("group") ?? undefined,
        audience: request.nextUrl.searchParams.get("audience") ?? undefined,
        frequency: request.nextUrl.searchParams.get("frequency") ?? undefined,
        billing: request.nextUrl.searchParams.get("billing") ?? undefined,
      });
    }

    if (pathname.startsWith("/retreat/booking/")) {
      const bookingId = pathname.slice("/retreat/booking/".length).split("/")[0];
      const participantRaw = request.nextUrl.searchParams.get("participant");
      const participant = participantRaw ? Number(participantRaw) : undefined;
      return redirectToRegister(request, {
        next: "retreat",
        booking: bookingId || undefined,
        participant: Number.isInteger(participant) ? participant : undefined,
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/donation",
    "/shop/checkout",
    "/checkout/service",
    "/retreat/booking/:path*",
    "/api/checkout/:path*",
    "/admin",
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
