import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { ADMIN_COOKIE } from "./constants";
import { decodeAdminCookie } from "./session";

export { encodeAdminCookie, adminCookieOptions } from "./session";

/**
 * Compares the submitted password in constant time.
 *
 * Both sides are hashed first so the comparison is over two fixed-length digests — `timingSafeEqual`
 * throws on a length mismatch, and the length of the real password should not leak either. A plain
 * `===` returns as soon as two characters differ, which in principle allows recovering the password
 * one character at a time.
 */
export function verifyAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD?.trim();
  if (!expected) return false;

  const submitted = createHash("sha256").update(password).digest();
  const actual = createHash("sha256").update(expected).digest();
  return timingSafeEqual(submitted, actual);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return decodeAdminCookie(store.get(ADMIN_COOKIE)?.value);
}
