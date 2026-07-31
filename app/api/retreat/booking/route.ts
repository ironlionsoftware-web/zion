import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { validateParticipantsInput, validateRetreatTypeSlug } from "@/lib/retreat/booking";
import { resolveRetreatPricing } from "@/lib/retreat/pricing";
import { saveRetreatBooking } from "@/lib/retreat/storage";
import type { RetreatBooking } from "@/lib/retreat/types";

export async function POST(request: Request) {
  let body: { participants?: unknown; retreatTypeSlug?: unknown; retreatDurationSlug?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const retreatType = validateRetreatTypeSlug(body.retreatTypeSlug);
  if (!retreatType.ok) {
    return NextResponse.json({ error: retreatType.error }, { status: 400 });
  }

  const pricing = resolveRetreatPricing(
    retreatType.slug,
    typeof body.retreatDurationSlug === "string" ? body.retreatDurationSlug : undefined,
  );
  if (!pricing.ok) {
    return NextResponse.json({ error: pricing.error }, { status: 400 });
  }

  const validated = validateParticipantsInput(body.participants, retreatType.slug);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const booking: RetreatBooking = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    retreatTypeSlug: retreatType.slug,
    retreatTypeLabel: retreatType.label,
    retreatDurationSlug: pricing.durationSlug,
    retreatDurationLabel: pricing.durationLabel,
    totalCents: pricing.totalCents,
    depositCents: pricing.depositCents,
    balanceCents: pricing.balanceCents,
    participants: validated.participants,
  };

  // The booking record is the product here — if it does not save, the visitor must not be sent on
  // to pay for something that does not exist. This was previously unguarded, and because the old
  // file-based storage always threw on Vercel's read-only filesystem, retreat registration
  // returned a bare 500 in production for every visitor who tried it.
  try {
    await saveRetreatBooking(booking);
  } catch (error) {
    console.error("saveRetreatBooking failed:", error);
    return NextResponse.json(
      {
        error:
          "We could not save your retreat registration, and nothing has been charged. " +
          "Please try again, or email us and we will book you in directly.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ bookingId: booking.id });
}
