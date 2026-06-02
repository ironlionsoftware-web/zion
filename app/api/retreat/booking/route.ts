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

  const validated = validateParticipantsInput(body.participants);
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

  await saveRetreatBooking(booking);

  return NextResponse.json({ bookingId: booking.id });
}
