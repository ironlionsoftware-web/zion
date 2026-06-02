import { NextResponse } from "next/server";
import { resolveCartLines } from "@/lib/cart/products";
import type { CartLine } from "@/lib/cart/types";
import { parsePaymentPlan } from "@/lib/payments/types";
import { requireRegistration } from "@/lib/payments/require-registration";
import { createStripeCheckoutSession } from "@/lib/stripe/checkout";
import { getStripe } from "@/lib/stripe/server";

export async function POST(request: Request) {
  const auth = await requireRegistration();
  if (auth instanceof NextResponse) return auth;
  const { registration } = auth;

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Payments are not configured yet." }, { status: 503 });
  }

  let body: { items?: unknown; paymentPlan?: unknown; fulfillmentNote?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  const rawItems: CartLine[] = body.items
    .map((row) => {
      if (typeof row !== "object" || row === null) return null;
      const slug = "slug" in row && typeof row.slug === "string" ? row.slug : "";
      const quantity = "quantity" in row ? Number(row.quantity) : 0;
      if (!slug || !Number.isInteger(quantity) || quantity < 1) return null;
      return { slug, quantity };
    })
    .filter((row): row is CartLine => row !== null);

  const lines = resolveCartLines(rawItems);
  if (lines.length === 0) {
    return NextResponse.json({ error: "No valid items in cart." }, { status: 400 });
  }

  const paymentPlan = parsePaymentPlan(body.paymentPlan);
  const fulfillmentNote =
    typeof body.fulfillmentNote === "string" ? body.fulfillmentNote.trim().slice(0, 500) : "";
  const origin = new URL(request.url).origin;

  const session = await createStripeCheckoutSession({
    stripe,
    registration,
    paymentPlan,
    lineItems: lines.map((line) => ({
      name: line.name,
      quantity: line.quantity,
      unitAmountCents: line.priceCents,
    })),
    successUrl: `${origin}/shop/checkout?success=1&session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${origin}/shop/checkout?canceled=1`,
    metadata: {
      checkout_type: "shop",
      fulfillment_note: fulfillmentNote || "none",
      cart: lines.map((l) => `${l.slug}x${l.quantity}`).join(","),
    },
  });

  if (!session.url) {
    return NextResponse.json({ error: "Could not start checkout." }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
