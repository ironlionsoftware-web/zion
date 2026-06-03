/**
 * Checks that Stripe env vars are present (does not call Stripe API).
 * Usage: node --env-file=.env.local scripts/verify-stripe.mjs
 */

const secret = process.env.STRIPE_SECRET_KEY?.trim();
const webhook = process.env.STRIPE_WEBHOOK_SECRET?.trim();
const registration = process.env.REGISTRATION_SECRET?.trim();

let ok = true;

if (!secret) {
  console.error("Missing STRIPE_SECRET_KEY (use sk_test_... locally, sk_live_... in production).");
  ok = false;
} else if (!secret.startsWith("sk_")) {
  console.error("STRIPE_SECRET_KEY should start with sk_test_ or sk_live_.");
  ok = false;
} else {
  console.log(`STRIPE_SECRET_KEY: set (${secret.startsWith("sk_test") ? "test mode" : "live mode"})`);
}

if (!webhook) {
  console.warn("Missing STRIPE_WEBHOOK_SECRET — checkout works, but orders may not save until webhooks are configured.");
} else if (!webhook.startsWith("whsec_")) {
  console.error("STRIPE_WEBHOOK_SECRET should start with whsec_.");
  ok = false;
} else {
  console.log("STRIPE_WEBHOOK_SECRET: set");
}

if (!registration) {
  console.error("Missing REGISTRATION_SECRET — required for checkout cookies.");
  ok = false;
} else {
  console.log("REGISTRATION_SECRET: set");
}

if (!ok) {
  console.error("\nSee docs/PAYMENTS.md for setup steps.");
  process.exit(1);
}

console.log("\nCard payments are configured. Restart the dev server (npm run dev) if it was already running.");
