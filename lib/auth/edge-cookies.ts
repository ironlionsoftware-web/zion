import { DEV_ADMIN_SECRET, DEV_REGISTRATION_SECRET } from "./constants";

/**
 * HMAC verification for the Edge runtime.
 *
 * `lib/admin/session.ts` and `lib/registration/cookie.ts` do the same job with `node:crypto`,
 * which cannot load in Proxy. This uses Web Crypto instead so the proxy can verify a cookie's
 * signature for real rather than eyeballing its shape. Both sides sign the same way:
 * `base64url(payload) + "." + base64url(HMAC-SHA256(secret, payload))`.
 *
 * Verification here is defence in depth — every admin route and page re-checks with the Node
 * implementation. The point is that adding a route which trusts the proxy can never silently
 * become an authentication bypass.
 */

/** Importing a CryptoKey costs more than the signature itself, so keep them per secret. */
const keyCache = new Map<string, Promise<CryptoKey>>();

function getKey(secret: string): Promise<CryptoKey> {
  const cached = keyCache.get(secret);
  if (cached) return cached;

  const key = crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  keyCache.set(secret, key);
  return key;
}

function base64url(bytes: ArrayBuffer): string {
  let binary = "";
  for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Constant-time compare so a signature can't be recovered by timing the response. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function resolveSecret(envName: string, devFallback: string): string | null {
  const key = process.env[envName]?.trim();
  if (key) return key;
  // Fail closed in production: no secret means no valid cookies, rather than a known key.
  return process.env.NODE_ENV === "production" ? null : devFallback;
}

async function hasValidSignature(value: string | undefined, secret: string | null): Promise<boolean> {
  if (!value || !secret) return false;

  const separator = value.lastIndexOf(".");
  if (separator <= 0) return false;

  const payload = value.slice(0, separator);
  const signature = value.slice(separator + 1);
  if (!payload || !signature) return false;

  try {
    const expected = base64url(
      await crypto.subtle.sign("HMAC", await getKey(secret), new TextEncoder().encode(payload)),
    );
    return timingSafeEqual(signature, expected);
  } catch {
    return false;
  }
}

export async function hasValidAdminCookie(value: string | undefined): Promise<boolean> {
  const secret = resolveSecret("ADMIN_SECRET", DEV_ADMIN_SECRET);
  if (!(await hasValidSignature(value, secret))) return false;

  // Mirrors the 12-hour window enforced by `decodeAdminCookie`.
  try {
    const payload = value!.slice(0, value!.lastIndexOf("."));
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const { at } = JSON.parse(json) as { at?: number };
    return Date.now() - (at ?? 0) < 12 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export async function hasValidRegistrationCookie(value: string | undefined): Promise<boolean> {
  return hasValidSignature(value, resolveSecret("REGISTRATION_SECRET", DEV_REGISTRATION_SECRET));
}
