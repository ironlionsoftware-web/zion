import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { clientIp, enforceRateLimit, rateLimit, resetRateLimits } from "@/lib/rate-limit";

/**
 * The public POST endpoints each spend money on the business's behalf — Resend sends, OpenAI
 * calls, database writes. These guard the throttle that stops a loop running up the bill.
 */

const request = (ip: string) => new Request("https://example.com/api/contact", { headers: { "x-forwarded-for": ip } });

describe("client identification", () => {
  it("takes the left-most forwarded address, which is the real client", () => {
    const req = new Request("https://example.com", {
      headers: { "x-forwarded-for": "203.0.113.5, 70.41.3.18, 150.172.238.178" },
    });
    assert.equal(clientIp(req), "203.0.113.5");
  });

  it("falls back to x-real-ip", () => {
    assert.equal(clientIp(new Request("https://example.com", { headers: { "x-real-ip": "203.0.113.9" } })), "203.0.113.9");
  });

  it("buckets unidentifiable callers together rather than exempting them", () => {
    assert.equal(clientIp(new Request("https://example.com")), "unknown");
  });
});

describe("rate limiting", () => {
  beforeEach(() => resetRateLimits());

  it("allows requests up to the limit and blocks the next one", () => {
    const options = { name: "test", limit: 3, windowMs: 60_000 };
    for (let i = 0; i < 3; i++) {
      assert.equal(rateLimit(request("1.1.1.1"), options).ok, true, `request ${i + 1} should pass`);
    }
    assert.equal(rateLimit(request("1.1.1.1"), options).ok, false, "the 4th should be blocked");
  });

  it("counts each address separately", () => {
    const options = { name: "test", limit: 1, windowMs: 60_000 };
    assert.equal(rateLimit(request("1.1.1.1"), options).ok, true);
    assert.equal(rateLimit(request("1.1.1.1"), options).ok, false);
    assert.equal(rateLimit(request("2.2.2.2"), options).ok, true, "a different visitor must not be punished");
  });

  it("keeps separate budgets per endpoint", () => {
    assert.equal(rateLimit(request("1.1.1.1"), { name: "contact", limit: 1, windowMs: 60_000 }).ok, true);
    assert.equal(rateLimit(request("1.1.1.1"), { name: "contact", limit: 1, windowMs: 60_000 }).ok, false);
    assert.equal(
      rateLimit(request("1.1.1.1"), { name: "pageview", limit: 1, windowMs: 60_000 }).ok,
      true,
      "hitting the contact limit must not block analytics",
    );
  });

  it("lets the caller back in once the window passes", async () => {
    const options = { name: "test", limit: 1, windowMs: 40 };
    assert.equal(rateLimit(request("1.1.1.1"), options).ok, true);
    assert.equal(rateLimit(request("1.1.1.1"), options).ok, false);
    await new Promise((resolve) => setTimeout(resolve, 60));
    assert.equal(rateLimit(request("1.1.1.1"), options).ok, true);
  });

  it("reports how long to wait", () => {
    const options = { name: "test", limit: 1, windowMs: 60_000 };
    rateLimit(request("1.1.1.1"), options);
    const blocked = rateLimit(request("1.1.1.1"), options);
    assert.equal(blocked.ok, false);
    assert.ok(blocked.retryAfterSeconds > 0 && blocked.retryAfterSeconds <= 60);
  });
});

describe("enforceRateLimit", () => {
  beforeEach(() => resetRateLimits());

  it("returns null while under the limit so the route continues", () => {
    assert.equal(enforceRateLimit(request("1.1.1.1"), { name: "test", limit: 2, windowMs: 60_000 }), null);
  });

  it("returns a 429 with Retry-After once over", async () => {
    const options = { name: "test", limit: 1, windowMs: 60_000 };
    enforceRateLimit(request("1.1.1.1"), options);
    const response = enforceRateLimit(request("1.1.1.1"), options);

    assert.ok(response, "expected a response");
    assert.equal(response.status, 429);
    assert.ok(Number(response.headers.get("Retry-After")) > 0);
    assert.match(((await response.json()) as { error: string }).error, /too many/i);
  });

  it("uses a custom message when given one", async () => {
    const options = { name: "test", limit: 1, windowMs: 60_000, message: "Please wait a moment." };
    enforceRateLimit(request("1.1.1.1"), options);
    const response = enforceRateLimit(request("1.1.1.1"), options);
    assert.equal(((await response!.json()) as { error: string }).error, "Please wait a moment.");
  });
});
