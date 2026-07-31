import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey) return null;
  if (!stripeClient) {
    // Pin the API version explicitly so bumping the `stripe` package (a caret range) can't
    // silently change request/webhook payload shape out from under us.
    stripeClient = new Stripe(secretKey, { apiVersion: "2026-04-22.dahlia" });
  }
  return stripeClient;
}

export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}
