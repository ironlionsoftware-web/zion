import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { activeProvider, providerNames } from "@/lib/notifications/providers";

/**
 * The site can send through Resend, SendGrid, or Postmark, because the domain's DNS is on Wix and
 * which provider Wix can actually satisfy is not known until its records verify. These tests hold
 * each provider's request shape correct so switching is a config change, not a debugging session.
 */

const KEYS = ["RESEND_API_KEY", "SENDGRID_API_KEY", "POSTMARK_SERVER_TOKEN", "EMAIL_PROVIDER"];

beforeEach(() => {
  for (const k of KEYS) delete process.env[k];
});

const build = (args?: Partial<Parameters<NonNullable<ReturnType<typeof activeProvider>>["provider"]["request"]>[1]>) => {
  const active = activeProvider();
  assert.ok(active, "expected a provider to be selected");
  return {
    name: active.provider.name,
    ...active.provider.request(active.key, {
      from: "Iron Lion <hello@ironlionfitnessandhealing.com>",
      to: "customer@example.com",
      subject: "Your session is confirmed",
      text: "Body text",
      ...args,
    }),
  };
};

describe("provider selection", () => {
  it("returns null when nothing is configured", () => {
    assert.equal(activeProvider(), null);
  });

  it("selects whichever provider has a key", () => {
    process.env.SENDGRID_API_KEY = "SG.test";
    assert.equal(activeProvider()?.provider.name, "sendgrid");
  });

  it("lets EMAIL_PROVIDER break a tie when several keys are present", () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.POSTMARK_SERVER_TOKEN = "pm-test";
    assert.equal(activeProvider()?.provider.name, "resend", "first in order wins by default");

    process.env.EMAIL_PROVIDER = "postmark";
    assert.equal(activeProvider()?.provider.name, "postmark", "explicit choice must win");
  });

  it("returns null when EMAIL_PROVIDER names a provider with no key", () => {
    process.env.EMAIL_PROVIDER = "sendgrid";
    process.env.RESEND_API_KEY = "re_test";
    assert.equal(activeProvider(), null, "must not silently fall back to a different provider");
  });

  it("knows all three providers", () => {
    assert.deepEqual(providerNames(), ["resend", "sendgrid", "postmark"]);
  });
});

describe("Resend request", () => {
  it("authenticates and addresses correctly", () => {
    process.env.RESEND_API_KEY = "re_test_key";
    const { url, init } = build();
    const body = JSON.parse(String(init.body));

    assert.equal(url, "https://api.resend.com/emails");
    assert.equal((init.headers as Record<string, string>).Authorization, "Bearer re_test_key");
    assert.deepEqual(body.to, ["customer@example.com"]);
    assert.equal(body.from, "Iron Lion <hello@ironlionfitnessandhealing.com>");
    assert.equal(body.subject, "Your session is confirmed");
  });

  it("includes reply_to only when given", () => {
    process.env.RESEND_API_KEY = "re_test_key";
    assert.equal(JSON.parse(String(build().init.body)).reply_to, undefined);
    assert.equal(
      JSON.parse(String(build({ replyTo: "hi@example.com" }).init.body)).reply_to,
      "hi@example.com",
    );
  });
});

describe("SendGrid request", () => {
  it("splits the from address into name and email", () => {
    process.env.SENDGRID_API_KEY = "SG.test_key";
    const { url, init } = build();
    const body = JSON.parse(String(init.body));

    assert.equal(url, "https://api.sendgrid.com/v3/mail/send");
    assert.equal((init.headers as Record<string, string>).Authorization, "Bearer SG.test_key");
    // SendGrid rejects "Name <addr>" in the email field; it must be split.
    assert.deepEqual(body.from, { name: "Iron Lion", email: "hello@ironlionfitnessandhealing.com" });
    assert.deepEqual(body.personalizations, [{ to: [{ email: "customer@example.com" }] }]);
    assert.deepEqual(body.content, [{ type: "text/plain", value: "Body text" }]);
  });

  it("handles a bare address with no display name", () => {
    process.env.SENDGRID_API_KEY = "SG.test_key";
    const body = JSON.parse(String(build({ from: "hello@example.com" }).init.body));
    assert.deepEqual(body.from, { email: "hello@example.com" });
  });
});

describe("Postmark request", () => {
  it("uses the token header and Postmark's field names", () => {
    process.env.POSTMARK_SERVER_TOKEN = "pm_test_token";
    const { url, init } = build();
    const body = JSON.parse(String(init.body));
    const headers = init.headers as Record<string, string>;

    assert.equal(url, "https://api.postmarkapp.com/email");
    // Postmark authenticates with a custom header, not Bearer.
    assert.equal(headers["X-Postmark-Server-Token"], "pm_test_token");
    assert.equal(headers.Authorization, undefined);
    assert.equal(body.From, "Iron Lion <hello@ironlionfitnessandhealing.com>");
    assert.equal(body.To, "customer@example.com");
    assert.equal(body.TextBody, "Body text");
    assert.equal(body.MessageStream, "outbound");
  });
});

describe("every provider", () => {
  it("carries the same subject, body and recipient", () => {
    for (const [key, expected] of [
      ["RESEND_API_KEY", "resend"],
      ["SENDGRID_API_KEY", "sendgrid"],
      ["POSTMARK_SERVER_TOKEN", "postmark"],
    ] as const) {
      for (const k of KEYS) delete process.env[k];
      process.env[key] = "test-key";

      const { name, init } = build();
      const raw = String(init.body);
      assert.equal(name, expected);
      assert.ok(raw.includes("customer@example.com"), `${name} lost the recipient`);
      assert.ok(raw.includes("Your session is confirmed"), `${name} lost the subject`);
      assert.ok(raw.includes("Body text"), `${name} lost the body`);
      assert.equal((init as { method?: string }).method, "POST");
    }
  });
});
