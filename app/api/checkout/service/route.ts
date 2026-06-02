import { NextResponse } from "next/server";
import { getClassOfferingFromServiceSlug, isClassService } from "@/lib/booking/classes";
import {
  computeServiceCheckoutCents,
  getPractitioner,
  isDualPractitionerSlug,
  parsePractitionerSlug,
} from "@/lib/booking/practitioners";
import {
  getCeremonyMedicine,
  isPlantMedicineCeremonyService,
  parseCeremonyMedicineSlug,
} from "@/lib/booking/ceremony-medicine";
import { getBookableService, site } from "@/content/site";
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

  let body: {
    serviceSlug?: unknown;
    paymentPlan?: unknown;
    practitionerSlug?: unknown;
    ceremonyMedicineSlug?: unknown;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const serviceSlug = typeof body.serviceSlug === "string" ? body.serviceSlug.trim() : "";
  const service = getBookableService(serviceSlug);
  if (!service) {
    return NextResponse.json({ error: "Unknown service." }, { status: 400 });
  }

  const isClass = isClassService(service.slug);
  const classOffering = getClassOfferingFromServiceSlug(service.slug);

  const practitionerSlug = isClass
    ? undefined
    : parsePractitionerSlug(typeof body.practitionerSlug === "string" ? body.practitionerSlug : undefined);
  if (!isClass && !practitionerSlug) {
    return NextResponse.json({ error: "Please choose a practitioner." }, { status: 400 });
  }
  const practitioner = practitionerSlug ? getPractitioner(practitionerSlug)! : undefined;

  const ceremonyMedicineSlug = isPlantMedicineCeremonyService(service.slug)
    ? parseCeremonyMedicineSlug(
        typeof body.ceremonyMedicineSlug === "string" ? body.ceremonyMedicineSlug : undefined,
      )
    : undefined;
  if (isPlantMedicineCeremonyService(service.slug) && !ceremonyMedicineSlug) {
    return NextResponse.json({ error: "Please choose Hape or Sananga." }, { status: 400 });
  }
  const ceremonyMedicine = ceremonyMedicineSlug ? getCeremonyMedicine(ceremonyMedicineSlug)! : undefined;

  const paymentPlan = parsePaymentPlan(body.paymentPlan);
  const origin = new URL(request.url).origin;
  const checkoutQuery = new URLSearchParams({ service: service.slug });
  if (practitionerSlug) checkoutQuery.set("practitioner", practitionerSlug);
  if (ceremonyMedicineSlug) checkoutQuery.set("ceremony", ceremonyMedicineSlug);

  const isDual = practitionerSlug ? isDualPractitionerSlug(practitionerSlug) : false;
  const unitAmountCents = practitionerSlug
    ? computeServiceCheckoutCents(service.priceCents, practitionerSlug)
    : service.priceCents;

  const practitionerLine = isDual
    ? "Dual session (both practitioners)"
    : practitioner!.name;

  const lineDescription = classOffering
    ? `${classOffering.schedule} · ${classOffering.format}`
    : ceremonyMedicine
      ? `${site.payments.serviceLineDescription} · ${ceremonyMedicine.label} · ${practitionerLine}`
      : `${site.payments.serviceLineDescription} · ${practitionerLine}`;

  const session = await createStripeCheckoutSession({
    stripe,
    registration,
    paymentPlan,
    lineItems: [
      {
        name: ceremonyMedicine ? `${service.label}: ${ceremonyMedicine.label}` : service.label,
        description: lineDescription,
        unitAmountCents,
        quantity: 1,
      },
    ],
    successUrl: `${origin}/checkout/service?${checkoutQuery.toString()}&success=1&session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${origin}/checkout/service?${checkoutQuery.toString()}&canceled=1`,
    metadata: {
      checkout_type: isClass ? "class" : "service",
      service_slug: service.slug,
      service_label: service.label,
      ...(classOffering
        ? {
            class_slug: classOffering.slug,
            class_schedule: classOffering.schedule,
          }
        : {}),
      ...(practitioner
        ? {
            practitioner_slug: practitioner.slug,
            practitioner_name: practitioner.name,
            ...(isDual ? { session_format: "dual" } : {}),
          }
        : {}),
      ...(ceremonyMedicine
        ? {
            ceremony_medicine_slug: ceremonyMedicine.slug,
            ceremony_medicine_label: ceremonyMedicine.label,
          }
        : {}),
    },
  });

  if (!session.url) {
    return NextResponse.json({ error: "Could not start checkout." }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
