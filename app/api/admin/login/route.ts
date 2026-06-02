import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/admin/constants";
import { adminCookieOptions, encodeAdminCookie, verifyAdminPassword } from "@/lib/admin/auth";

export async function POST(request: Request) {
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
