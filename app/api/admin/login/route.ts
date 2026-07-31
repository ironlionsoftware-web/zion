import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/admin/constants";
import { adminCookieOptions, encodeAdminCookie, verifyAdminPassword } from "@/lib/admin/auth";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  // The one door into every customer's contact details, and the only route under /api/admin
  // reachable without a session — so it is the natural target for password guessing. Ten attempts
  // per fifteen minutes is generous for a typo and useless for a brute-force.
  const limited = enforceRateLimit(request, {
    name: "admin-login",
    limit: 10,
    windowMs: 15 * 60 * 1000,
    message: "Too many sign-in attempts. Please wait fifteen minutes and try again.",
  });
  if (limited) return limited;

  let body: { password?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const password = typeof body.password === "string" ? body.password : "";
  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: "Invalid password." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, encodeAdminCookie(), adminCookieOptions());
  return response;
}
