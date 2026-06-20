import { NextResponse } from "next/server";
import { formatCartMetaLine, resolveCartLines } from "@/lib/cart/products";
import type { CartLine } from "@/lib/cart/types";
import { parsePaymentPlan } from "@/lib/payments/types";
import { requireRegistration } from "@/lib/payments/require-registration";
import {
  computeDeliveryFeeCents,
  formatDeliveryAddress,
  parseDeliveryAddress,
  type DeliveryAddressInput,
} from "@/lib/shipping/delivery";
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

  let body: { items?: unknown; paymentPlan?: unknown; deliveryAddress?: DeliveryAddressInput };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  const deliveryAddress = parseDeliveryAddress(body.deliveryAddress ?? {});
  if (!deliveryAddress) {
    return NextResponse.json({ error: "Please enter a valid delivery address." }, { status: 400 });
  }

  const rawItems = body.items
    .map((row) => {
      if (typeof row !== "object" || row === null) return null;
      const slug = "slug" in row && typeof row.slug === "string" ? row.slug : "";
      const variantId =
        "variantId" in row && typeof row.variantId === "string" ? row.variantId : undefined;
      const quantity = "quantity" in row ? Number(row.quantity) : 0;
      if (!slug || !Number.isInteger(quantity) || quantity < 1) return null;
      const line: CartLine = { slug, quantity };
      if (variantId) line.variantId = variantId;
      return line;
    })
    .filter((row): row is CartLine => row !== null);

  const lines = resolveCartLines(rawItems);
  if (lines.length === 0) {
    return NextResponse.json({ error: "No valid items in cart." }, { status: 400 });
  }

  const paymentPlan = parsePaymentPlan(body.paymentPlan);
  const deliveryFeeCents = computeDeliveryFeeCents(deliveryAddress);
  const formattedAddress = formatDeliveryAddress(deliveryAddress);
  const origin = new URL(request.url).origin;

  const stripeLineItems = lines.map((line) => ({
    name: line.name,
    quantity: line.quantity,
    unitAmountCents: line.priceCents,
  }));

  if (deliveryFeeCents > 0) {
    stripeLineItems.push({
      name: "Delivery fee",
      quantity: 1,
      unitAmountCents: deliveryFeeCents,
    });
  }

  const session = await createStripeCheckoutSession({
    stripe,
    registration,
    paymentPlan,
    lineItems: stripeLineItems,
    successUrl: `${origin}/shop/checkout?success=1&session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${origin}/shop/checkout?canceled=1`,
    metadata: {
      checkout_type: "shop",
      fulfillment_note: formattedAddress,
      delivery_fee_cents: String(deliveryFeeCents),
      free_delivery: deliveryFeeCents === 0 ? "true" : "false",
      delivery_city: deliveryAddress.city,
      delivery_state: deliveryAddress.state,
      delivery_postal: deliveryAddress.postalCode,
      cart: lines.map(formatCartMetaLine).join(","),
    },
  });

  if (!session.url) {
    return NextResponse.json({ error: "Could not start checkout." }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
