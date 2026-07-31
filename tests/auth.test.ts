import assert from "node:assert/strict";
import { describe, it, before } from "node:test";

/**
 * Regression guards for the authentication fixes.
 *
 * Cookies are signed in the Node runtime and verified again in the Edge runtime (Proxy) by two
 * separate implementations. If those ever disagree, every visitor is silently signed out — so the
 * interop tests below matter as much as the rejection tests.
 */

// Must be set before the modules read them.
process.env.ADMIN_SECRET = "test-admin-secret-at-least-32-characters-long";
process.env.REGISTRATION_SECRET = "test-registration-secret-32-characters-long";

const { encodeAdminCookie, decodeAdminCookie } = await import("@/lib/admin/session");
const { encodeRegistrationCookie, decodeRegistrationCookie } = await import("@/lib/registration/cookie");
const { hasValidAdminCookie, hasValidRegistrationCookie } = await import("@/lib/auth/edge-cookies");
const { registrationOwnsBooking, participantMatchesRegistration } = await import("@/lib/retreat/booking");
const { validateRegistrationInput } = await import("@/lib/registration/validate");

const registration = {
  fullName: "Ada Lovelace",
  email: "ada@example.com",
  phone: "5125550111",
  registeredAt: new Date().toISOString(),
};

describe("admin session cookie", () => {
  it("round-trips through the Node implementation", () => {
    assert.equal(decodeAdminCookie(encodeAdminCookie()), true);
  });

  it("is accepted by the Edge implementation that signed it in Node", async () => {
    assert.equal(await hasValidAdminCookie(encodeAdminCookie()), true);
  });

  it("rejects a tampered signature", async () => {
    const cookie = encodeAdminCookie();
    const tampered = cookie.slice(0, -3) + "AAA";
    assert.equal(decodeAdminCookie(tampered), false);
    assert.equal(await hasValidAdminCookie(tampered), false);
  });

  it("rejects a tampered payload", async () => {
    const cookie = encodeAdminCookie();
    assert.equal(await hasValidAdminCookie("x" + cookie), false);
  });

  it("rejects a cookie that merely looks right", async () => {
    // The proxy used to accept anything shaped `a.b` with a segment over eight characters. This
    // is the exact string that used to walk straight past it.
    assert.equal(await hasValidAdminCookie("eyJhdCI6MX0.aaaaaaaaaaaaaaaaaaa"), false);
    assert.equal(await hasValidAdminCookie("payload.signature123456789"), false);
  });

  it("rejects empty and missing values", async () => {
    assert.equal(await hasValidAdminCookie(""), false);
    assert.equal(await hasValidAdminCookie(undefined), false);
    assert.equal(decodeAdminCookie(undefined), false);
  });

  it("expires after twelve hours", async () => {
    const { createHmac } = await import("node:crypto");
    const stale = Buffer.from(
      JSON.stringify({ at: Date.now() - 13 * 60 * 60 * 1000 }),
      "utf8",
    ).toString("base64url");
    const signature = createHmac("sha256", process.env.ADMIN_SECRET!).update(stale).digest("base64url");
    const cookie = `${stale}.${signature}`;

    assert.equal(decodeAdminCookie(cookie), false);
    assert.equal(await hasValidAdminCookie(cookie), false);
  });
});

describe("registration cookie", () => {
  it("round-trips and normalises the email", () => {
    const decoded = decodeRegistrationCookie(
      encodeRegistrationCookie({ ...registration, email: "  ADA@Example.com  " }),
    );
    assert.equal(decoded?.email, "ada@example.com");
  });

  it("is accepted by the Edge implementation", async () => {
    assert.equal(await hasValidRegistrationCookie(encodeRegistrationCookie(registration)), true);
  });

  it("rejects a tampered cookie in both runtimes", async () => {
    const tampered = encodeRegistrationCookie(registration).slice(0, -3) + "ZZZ";
    assert.equal(decodeRegistrationCookie(tampered), null);
    assert.equal(await hasValidRegistrationCookie(tampered), false);
  });

  it("rejects a signature of the wrong length", () => {
    // Guards the length check that keeps `timingSafeEqual` from throwing.
    const [payload] = encodeRegistrationCookie(registration).split(".");
    assert.equal(decodeRegistrationCookie(`${payload}.short`), null);
  });

  it("rejects a shape-only forgery", async () => {
    assert.equal(await hasValidRegistrationCookie("aaaaaaaaaaaa.bbbbbbbbbb"), false);
  });
});

describe("retreat booking ownership", () => {
  const booking = {
    participants: [
      { email: "ada@example.com" },
      { email: "grace@example.com" },
    ],
  } as Parameters<typeof registrationOwnsBooking>[0];

  it("lets a participant through", () => {
    assert.equal(registrationOwnsBooking(booking, { email: "ada@example.com" }), true);
    assert.equal(registrationOwnsBooking(booking, { email: "grace@example.com" }), true);
  });

  it("ignores case, since the cookie and the form may differ", () => {
    assert.equal(registrationOwnsBooking(booking, { email: "ADA@EXAMPLE.COM" }), true);
  });

  it("keeps everyone else out", () => {
    // Registration is self-service with no email verification, so being registered proves nothing
    // about which booking you may read.
    assert.equal(registrationOwnsBooking(booking, { email: "stranger@example.com" }), false);
  });

  it("treats an empty booking as owned by nobody", () => {
    assert.equal(registrationOwnsBooking({ participants: [] }, { email: "ada@example.com" }), false);
  });

  it("matches a single participant exactly", () => {
    assert.equal(participantMatchesRegistration({ email: "ada@example.com" } as never, { email: "ada@example.com" }), true);
    assert.equal(participantMatchesRegistration({ email: "ada@example.com" } as never, { email: "ada@example.co" }), false);
  });
});

describe("registration validation", () => {
  const valid = { fullName: "Ada Lovelace", email: "ada@example.com", phone: "512-555-0111" };

  it("accepts a complete registration", () => {
    const result = validateRegistrationInput({ ...valid, marketingConsent: true });
    assert.equal(result.ok, true);
  });

  it("no longer requires marketing consent", () => {
    // Consent that is a condition of buying is not freely given. It is recorded, never demanded.
    const result = validateRegistrationInput({ ...valid, marketingConsent: false });
    assert.equal(result.ok, true);
    assert.ok(result.ok && result.marketingConsent === false, "the choice must still be recorded");
  });

  it("still rejects incomplete contact details", () => {
    assert.equal(validateRegistrationInput({ ...valid, fullName: "A" }).ok, false);
    assert.equal(validateRegistrationInput({ ...valid, email: "not-an-email" }).ok, false);
    assert.equal(validateRegistrationInput({ ...valid, phone: "123" }).ok, false);
  });
});

describe("production fails closed without secrets", () => {
  before(() => {
    delete process.env.ADMIN_SECRET;
    delete process.env.REGISTRATION_SECRET;
    // NODE_ENV is typed readonly, but the whole point here is to exercise the production branch.
    (process.env as Record<string, string | undefined>).NODE_ENV = "production";
  });

  it("rejects cookies rather than trusting the committed dev key", async () => {
    // The dev fallback strings live in this public repo. Falling back to them in production would
    // let anyone mint a valid admin session.
    assert.equal(await hasValidAdminCookie("eyJhdCI6MX0.whatever"), false);
    assert.equal(await hasValidRegistrationCookie("eyJhIjoxfQ.whatever"), false);
  });

  it("refuses to issue an admin cookie at all", () => {
    assert.throws(() => encodeAdminCookie(), /ADMIN_SECRET is not set/);
  });
});
