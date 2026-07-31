import { NextResponse } from "next/server";
import { parseCeremonyMedicineSlug, isPlantMedicineCeremonyService } from "@/lib/booking/ceremony-medicine";
import { isReikiService, parseReikiAddOnSlugs } from "@/lib/booking/reiki-addon";
import { parsePractitionerSlug } from "@/lib/booking/practitioners";
import { shouldIncludeFitnessOnlyPractitioner, isFitnessTrainingService } from "@/lib/booking/fitness-trainers";
import { parseFitnessBookingOptions } from "@/lib/booking/fitness-options";
import {
  encodeRegistrationCookie,
  registrationCookieOptions,
  REGISTRATION_COOKIE,
} from "@/lib/registration/cookie";
import { enforceRateLimit } from "@/lib/rate-limit";
import { parseRegisterNext, redirectAfterRegistration } from "@/lib/registration/redirect";
import { saveRegistration } from "@/lib/registration/storage";
import type { RegisterNext } from "@/lib/registration/types";
import { validateRegistrationInput } from "@/lib/registration/validate";

export async function POST(request: Request) {
  // Registration writes a row and emails the business. Allow retries and genuine multi-person
  // sign-ups from one household, but not automated flooding.
  const limited = enforceRateLimit(request, {
    name: "register",
    limit: 10,
    windowMs: 10 * 60 * 1000,
    message: "Too many registration attempts. Please wait a few minutes and try again.",
  });
  if (limited) return limited;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const validated = validateRegistrationInput(body);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const next = parseRegisterNext(typeof body.next === "string" ? body.next : undefined);
  const serviceSlug = typeof body.service === "string" ? body.service.trim() : undefined;
  const practitionerSlug =
    next === "book"
      ? parsePractitionerSlug(typeof body.practitioner === "string" ? body.practitioner : undefined, {
          includeFitnessOnly: shouldIncludeFitnessOnlyPractitioner(serviceSlug),
        })
      : undefined;
  if (next === "book" && !practitionerSlug) {
    return NextResponse.json({ error: "Please choose a practitioner." }, { status: 400 });
  }
  const ceremonyMedicineSlug =
    isPlantMedicineCeremonyService(serviceSlug)
      ? parseCeremonyMedicineSlug(typeof body.ceremonyMedicine === "string" ? body.ceremonyMedicine : undefined)
      : undefined;
  if (isPlantMedicineCeremonyService(serviceSlug) && !ceremonyMedicineSlug) {
    return NextResponse.json({ error: "Please choose a ceremony option." }, { status: 400 });
  }
  const reikiAddOnSlugs = isReikiService(serviceSlug)
    ? parseReikiAddOnSlugs(
        Array.isArray(body.reikiAddOns)
          ? body.reikiAddOns.filter((item): item is string => typeof item === "string")
          : typeof body.reikiAddOn === "string"
            ? body.reikiAddOn
            : undefined,
      )
    : [];
  const fitnessOptions = isFitnessTrainingService(serviceSlug)
    ? parseFitnessBookingOptions({
        session: typeof body.fitnessSession === "string" ? body.fitnessSession : undefined,
        format: typeof body.fitnessFormat === "string" ? body.fitnessFormat : undefined,
        group:
          typeof body.fitnessGroup === "number"
            ? body.fitnessGroup
            : typeof body.fitnessGroup === "string"
              ? body.fitnessGroup
              : undefined,
        audience: typeof body.fitnessAudience === "string" ? body.fitnessAudience : undefined,
        frequency:
          typeof body.fitnessFrequency === "number"
            ? body.fitnessFrequency
            : typeof body.fitnessFrequency === "string"
              ? body.fitnessFrequency
              : undefined,
        billing: typeof body.fitnessBilling === "string" ? body.fitnessBilling : undefined,
      })
    : undefined;
  if (isFitnessTrainingService(serviceSlug) && !fitnessOptions) {
    return NextResponse.json({ error: "Please choose your fitness training options." }, { status: 400 });
  }
  const bookingId = typeof body.booking === "string" ? body.booking.trim() : undefined;
  const participantIndex =
    typeof body.participant === "number"
      ? body.participant
      : typeof body.participant === "string"
        ? Number(body.participant)
        : undefined;
  const source = typeof body.source === "string" ? body.source.trim() : "register";

  const registeredAt = new Date().toISOString();
  const client = {
    fullName: validated.fullName,
    email: validated.email,
    phone: validated.phone,
    registeredAt,
  };

  // Deliberately non-fatal, unlike the retreat booking route. This row is a lead record, not the
  // thing being bought — losing it costs a line in the admin list, whereas blocking here would
  // stop someone completing a purchase they were ready to make. The failure is logged so it can
  // be reconciled against Stripe later.
  try {
    await saveRegistration({
      ...client,
      marketingConsent: validated.marketingConsent,
      next,
      service: serviceSlug || undefined,
      practitioner: practitionerSlug,
      source,
    });
  } catch (error) {
    console.error("saveRegistration failed; letting the visitor continue anyway:", error);
  }

  const { url, external } = redirectAfterRegistration(next, client, {
    serviceSlug,
    bookingId,
    participantIndex: Number.isInteger(participantIndex) ? participantIndex : undefined,
    practitionerSlug,
    ceremonyMedicineSlug,
    reikiAddOnSlugs: reikiAddOnSlugs.length > 0 ? reikiAddOnSlugs : undefined,
    fitnessOptions,
  });
  const response = NextResponse.json({ redirect: url, external });

  response.cookies.set(
    REGISTRATION_COOKIE,
    encodeRegistrationCookie(client),
    registrationCookieOptions(),
  );

  return response;
}
