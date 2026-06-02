import { NextResponse } from "next/server";
import { parseCeremonyMedicineSlug, isPlantMedicineCeremonyService } from "@/lib/booking/ceremony-medicine";
import { parsePractitionerSlug } from "@/lib/booking/practitioners";
import {
  encodeRegistrationCookie,
  registrationCookieOptions,
  REGISTRATION_COOKIE,
} from "@/lib/registration/cookie";
import { parseRegisterNext, redirectAfterRegistration } from "@/lib/registration/redirect";
import { saveRegistration } from "@/lib/registration/storage";
import type { RegisterNext } from "@/lib/registration/types";
import { validateRegistrationInput } from "@/lib/registration/validate";

export async function POST(request: Request) {
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
    next === "book" ? parsePractitionerSlug(typeof body.practitioner === "string" ? body.practitioner : undefined) : undefined;
  if (next === "book" && !practitionerSlug) {
    return NextResponse.json({ error: "Please choose a practitioner." }, { status: 400 });
  }
  const ceremonyMedicineSlug =
    isPlantMedicineCeremonyService(serviceSlug)
      ? parseCeremonyMedicineSlug(typeof body.ceremonyMedicine === "string" ? body.ceremonyMedicine : undefined)
      : undefined;
  if (isPlantMedicineCeremonyService(serviceSlug) && !ceremonyMedicineSlug) {
    return NextResponse.json({ error: "Please choose Hape or Sananga." }, { status: 400 });
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

  await saveRegistration({
    ...client,
    marketingConsent: validated.marketingConsent,
    next,
    service: serviceSlug || undefined,
    practitioner: practitionerSlug,
    source,
  });

  const { url, external } = redirectAfterRegistration(next, client, {
    serviceSlug,
    bookingId,
    participantIndex: Number.isInteger(participantIndex) ? participantIndex : undefined,
    practitionerSlug,
    ceremonyMedicineSlug,
  });
  const response = NextResponse.json({ redirect: url, external });

  response.cookies.set(
    REGISTRATION_COOKIE,
    encodeRegistrationCookie(client),
    registrationCookieOptions(),
  );

  return response;
}
