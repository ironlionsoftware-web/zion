import { createHmac, timingSafeEqual } from "crypto";
import { DEV_ADMIN_SECRET } from "@/lib/auth/constants";

/**
 * Below this an HMAC key is brute-forceable. Warned about rather than enforced, so a deploy can
 * never lock the business out of its own admin panel.
 */
const MIN_SECRET_LENGTH = 32;

/**
 * Returns the key used to sign admin session cookies.
 *
 * Throws in production when unset. This previously fell back to a hardcoded string — which is
 * committed in this repo, and the repo is public — so anyone could compute a valid session cookie
 * and read every customer's contact details without a password. Failing closed turns a silent,
 * invisible compromise into an obvious outage.
 */
export function adminSecret(): string {
  const key = process.env.ADMIN_SECRET?.trim();
  if (key) {
    if (key.length < MIN_SECRET_LENGTH && process.env.NODE_ENV === "production") {
      console.warn(
        `ADMIN_SECRET is only ${key.length} characters; use at least ${MIN_SECRET_LENGTH}. ` +
          `Generate one with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`,
      );
    }
    return key;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "ADMIN_SECRET is not set. Refusing to sign or verify admin sessions — set it in your host's " +
        "environment variables and redeploy.",
    );
  }
  return DEV_ADMIN_SECRET;
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

  try {
    // `sign` throws when ADMIN_SECRET is missing in production. Rejecting the cookie is the
    // fail-closed outcome; an unauthenticated visitor must never be let through on an error.
    const expected = sign(payload);
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

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
