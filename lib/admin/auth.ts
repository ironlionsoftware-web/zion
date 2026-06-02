import { cookies } from "next/headers";
import { ADMIN_COOKIE } from "./constants";
import { decodeAdminCookie } from "./session";

export { encodeAdminCookie, adminCookieOptions } from "./session";

export function verifyAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD?.trim();
  if (!expected) return false;
  return password === expected;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return decodeAdminCookie(store.get(ADMIN_COOKIE)?.value);
}
