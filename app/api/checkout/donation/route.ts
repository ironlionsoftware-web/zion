import { NextResponse } from "next/server";
import { site } from "@/content/site";
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

  let amountCents: number;
  let body: { amountCents?: unknown; paymentPlan?: unknown };
  try {
    body = (await request.json()) as typeof body;
    amountCents = Number(body.amountCents);
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { minCents, maxCents } = site.donation;
  if (!Number.isInteger(amountCents) || amountCents < minCents || amountCents > maxCents) {
    return NextResponse.json(
      { error: `Choose an amount between $${minCents / 100} and $${maxCents / 100}.` },
      { status: 400 },
    );
  }

  const paymentPlan = parsePaymentPlan(body.paymentPlan);
  const origin = new URL(request.url).origin;

  const session = await createStripeCheckoutSession({
    stripe,
    registration,
    paymentPlan,
    lineItems: [
      {
        name: site.donation.title,
        description: site.donation.checkoutDescription,
        unitAmountCents: amountCents,
        quantity: 1,
      },
    ],
    successUrl: `${origin}/donation?success=1&session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${origin}/donation?canceled=1`,
    metadata: {
      checkout_type: "donation",
    },
  });

  if (!session.url) {
    return NextResponse.json({ error: "Could not start checkout." }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
