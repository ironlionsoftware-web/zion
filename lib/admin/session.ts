import { createHmac, timingSafeEqual } from "crypto";

export function adminSecret(): string {
  const key = process.env.ADMIN_SECRET?.trim();
  if (key) return key;
  if (process.env.NODE_ENV === "production") {
    console.warn("ADMIN_SECRET is not set; admin sessions are insecure.");
  }
  return "dev-only-admin-secret-change-me";
}

function sign(payload: string): string {
  return createHmac("sha256", adminSecret()).update(payload).digest("base64url");
}

export function encodeAdminCookie(): string {
  const payload = Buffer.from(JSON.stringify({ at: Date.now() }), "utf8").toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function decodeAdminCookie(value: string | undefined): boolean {
  if (!value) return false;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return false;

  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { at?: number };
    const at = parsed.at ?? 0;
    const maxAgeMs = 12 * 60 * 60 * 1000;
    return Date.now() - at < maxAgeMs;
  } catch {
    return false;
  }
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 12 * 60 * 60,
  };
}
