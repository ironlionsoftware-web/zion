import { NextResponse } from "next/server";
import { requireRegistration } from "@/lib/payments/require-registration";
import { parsePaymentPlan } from "@/lib/payments/types";
import {
  formatRetreatUsd,
  participantMatchesRegistration,
  retreatPricing,
  retreatTypeLabelForBooking,
} from "@/lib/retreat/booking";
import { retreatPricingForBooking } from "@/lib/retreat/pricing";
import { getRetreatBooking } from "@/lib/retreat/storage";
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

  let body: { bookingId?: unknown; participantIndex?: unknown; paymentPlan?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const bookingId = typeof body.bookingId === "string" ? body.bookingId.trim() : "";
  const participantIndex = Number(body.participantIndex);
  const paymentPlan = parsePaymentPlan(body.paymentPlan);

  const booking = await getRetreatBooking(bookingId);
  if (!booking || !Number.isInteger(participantIndex)) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  const participant = booking.participants[participantIndex];
  if (!participant) {
    return NextResponse.json({ error: "Participant not found." }, { status: 404 });
  }

  if (!participantMatchesRegistration(participant, registration)) {
    return NextResponse.json(
      {
        error:
          "Sign in with the same email you used on the retreat registration form before paying.",
        code: "email_mismatch",
      },
      { status: 403 },
    );
  }

  if (participant.depositPaidAt) {
    return NextResponse.json({ error: "Deposit already paid for this participant." }, { status: 400 });
  }

  const { title } = retreatPricing();
  const quote = retreatPricingForBooking(booking);
  const retreatLabel = retreatTypeLabelForBooking(booking);
  const origin = new URL(request.url).origin;
  const encodedBooking = encodeURIComponent(bookingId);

  const session = await createStripeCheckoutSession({
    stripe,
    registration,
    paymentPlan,
    lineItems: [
      {
        name: `${retreatLabel} deposit`,
        description: `${formatRetreatUsd(quote.depositCents)} down payment for ${participant.fullName} · ${title} (total ${formatRetreatUsd(quote.totalCents)})`,
        unitAmountCents: quote.depositCents,
        quantity: 1,
      },
    ],
    successUrl: `${origin}/retreat/booking/${encodedBooking}?participant=${participantIndex}&payment=deposit&session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${origin}/retreat/booking/${encodedBooking}?participant=${participantIndex}&payment=deposit&canceled=1`,
    metadata: {
      checkout_type: "retreat_deposit",
      booking_id: bookingId,
      participant_index: String(participantIndex),
      payment_type: "deposit",
      retreat_type_slug: booking.retreatTypeSlug ?? "",
      retreat_type_label: retreatLabel,
    },
  });

  if (!session.url) {
    return NextResponse.json({ error: "Could not start checkout." }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
