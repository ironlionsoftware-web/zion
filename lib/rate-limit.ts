import { NextResponse } from "next/server";

/**
 * Fixed-window per-IP rate limiting for public endpoints.
 *
 * Deliberately in-memory and dependency-free. State lives in a single serverless instance, so a
 * determined attacker spread across many cold starts gets more requests through than the nominal
 * limit — but the goal here is not perfect fairness. It is to stop a trivial `while true` loop
 * from running up the Resend, OpenAI and Neon bills or flooding the inbox with fake enquiries,
 * and it does that for free.
 *
 * If the site ever needs exact limits (or gets targeted), swap the Map for Vercel KV / Upstash;
 * the `rateLimit` signature is designed so only this file changes.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/** Bounds worst-case memory if an attacker rotates IPs. Oldest windows are evicted first. */
const MAX_TRACKED_KEYS = 10_000;

function prune(now: number): void {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
  if (buckets.size <= MAX_TRACKED_KEYS) return;
  const sorted = [...buckets.entries()].sort((a, b) => a[1].resetAt - b[1].resetAt);
  for (const [key] of sorted.slice(0, buckets.size - MAX_TRACKED_KEYS)) buckets.delete(key);
}

/**
 * Best-effort client identity. On Vercel `x-forwarded-for` is set by the platform edge and the
 * left-most entry is the real client. Requests with no usable header share one bucket, which is
 * intentional — an anonymous flood should throttle itself.
 */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export type RateLimitOptions = {
  /** Distinguishes buckets between routes so a contact-form limit can't block analytics. */
  name: string;
  /** Requests allowed per window. */
  limit: number;
  windowMs: number;
};

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export function rateLimit(request: Request, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  if (Math.random() < 0.01) prune(now);

  const key = `${options.name}:${clientIp(request)}`;
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    return { ok: true, remaining: options.limit - 1, retryAfterSeconds: 0 };
  }

  existing.count += 1;
  const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));

  if (existing.count > options.limit) {
    return { ok: false, remaining: 0, retryAfterSeconds };
  }
  return { ok: true, remaining: options.limit - existing.count, retryAfterSeconds };
}

/**
 * Applies a limit and returns a ready-to-send 429 when exceeded, or `null` to continue.
 *
 * ```ts
 * const limited = enforceRateLimit(request, { name: "contact", limit: 5, windowMs: 600_000 });
 * if (limited) return limited;
 * ```
 */
export function enforceRateLimit(
  request: Request,
  options: RateLimitOptions & { message?: string },
): NextResponse | null {
  const result = rateLimit(request, options);
  if (result.ok) return null;

  return NextResponse.json(
    { error: options.message ?? "Too many requests. Please wait a moment and try again." },
    { status: 429, headers: { "Retry-After": String(result.retryAfterSeconds) } },
  );
}

/** Clears all state. Test helper. */
export function resetRateLimits(): void {
  buckets.clear();
}
