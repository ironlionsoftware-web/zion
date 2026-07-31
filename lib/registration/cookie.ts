import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { DEV_REGISTRATION_SECRET } from "@/lib/auth/constants";
import type { ClientRegistration } from "./types";
import { REGISTRATION_COOKIE } from "./constants";

export { REGISTRATION_COOKIE };

/**
 * Returns the key used to sign registration cookies.
 *
 * Throws in production when unset, rather than falling back to a string committed in this public
 * repo. A forged registration cookie impersonates a registered client — and since retreat booking
 * access is now tied to the registered email, that would expose other participants' contact and
 * health details. Checkout amounts stay server-computed regardless of cookie contents.
 */
function secret(): string {
  const key = process.env.REGISTRATION_SECRET?.trim();
  if (key) return key;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "REGISTRATION_SECRET is not set. Refusing to sign or verify registration cookies — set it " +
        "in your host's environment variables and redeploy.",
    );
  }
  return DEV_REGISTRATION_SECRET;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function encodeRegistrationCookie(data: ClientRegistration): string {
  const payload = Buffer.from(JSON.stringify(data), "utf8").toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function decodeRegistrationCookie(value: string | undefined): ClientRegistration | null {
  if (!value) return null;

  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;

  try {
    // `sign` throws when REGISTRATION_SECRET is missing in production. Treating that as an
    // invalid cookie is the fail-closed outcome.
    const expected = sign(payload);
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as ClientRegistration;
    if (!parsed.fullName?.trim() || !parsed.email?.trim() || !parsed.phone?.trim()) return null;
    return {
      fullName: parsed.fullName.trim(),
      email: parsed.email.trim().toLowerCase(),
      phone: parsed.phone.trim(),
      registeredAt: parsed.registeredAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export async function getRegistration(): Promise<ClientRegistration | null> {
  const store = await cookies();
  return decodeRegistrationCookie(store.get(REGISTRATION_COOKIE)?.value);
}


export function registrationCookieOptions(maxAgeDays = 30) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeDays * 24 * 60 * 60,
  };
}
