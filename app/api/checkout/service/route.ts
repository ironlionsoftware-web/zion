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
import {
  getReikiAddOnPriceCents,
  isReikiService,
  parseReikiAddOnSlugs,
  resolveReikiAddOns,
  serializeReikiAddOnSlugs,
} from "@/lib/booking/reiki-addon";
import { getBookableService, site } from "@/content/site";
import { parsePaymentPlan } from "@/lib/payments/types";
import { requireRegistration } from "@/lib/payments/require-registration";
import { createStripeCheckoutSession } from "@/lib/stripe/checkout";
import type { CheckoutLineItem } from "@/lib/stripe/checkout";
import { getStripe } from "@/lib/stripe/server";

function parseReikiAddOnSlugsFromBody(value: unknown): string[] {
  if (Array.isArray(value)) {
    return parseReikiAddOnSlugs(value.filter((item): item is string => typeof item === "string"));
  }
  if (typeof value === "string") {
    return parseReikiAddOnSlugs(value);
  }
  return [];
}

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
    reikiAddOnSlug?: unknown;
    reikiAddOnSlugs?: unknown;
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

  const reikiAddOnSlugs = isReikiService(service.slug)
    ? parseReikiAddOnSlugsFromBody(body.reikiAddOnSlugs ?? body.reikiAddOnSlug)
    : [];
  const reikiAddOns = resolveReikiAddOns(reikiAddOnSlugs);

  const paymentPlan = parsePaymentPlan(body.paymentPlan);
  const origin = new URL(request.url).origin;
  const checkoutQuery = new URLSearchParams({ service: service.slug });
  if (practitionerSlug) checkoutQuery.set("practitioner", practitionerSlug);
  if (ceremonyMedicineSlug) checkoutQuery.set("ceremony", ceremonyMedicineSlug);
  const addonQuery = reikiAddOnSlugs.length > 0 ? serializeReikiAddOnSlugs(reikiAddOnSlugs) : "";
  if (addonQuery) checkoutQuery.set("addon", addonQuery);

  const isDual = practitionerSlug ? isDualPractitionerSlug(practitionerSlug) : false;
  const serviceUnitCents = practitionerSlug
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

  const lineItems: CheckoutLineItem[] = [
    {
      name: ceremonyMedicine ? `${service.label}: ${ceremonyMedicine.label}` : service.label,
      description: lineDescription,
      unitAmountCents: serviceUnitCents,
      quantity: 1,
    },
  ];

  const addOnPrice = getReikiAddOnPriceCents();
  for (const addOn of reikiAddOns) {
    lineItems.push({
      name: `${addOn.label} add-on`,
      description: `With ${service.label} · ${practitionerLine}`,
      unitAmountCents: addOnPrice,
      quantity: 1,
    });
  }

  const session = await createStripeCheckoutSession({
    stripe,
    registration,
    paymentPlan,
    lineItems,
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
      ...(reikiAddOns.length > 0
        ? {
            ceremony_medicine_slug: reikiAddOns.map((a) => a.slug).join(","),
            ceremony_medicine_label: reikiAddOns.map((a) => a.label).join(", "),
          }
        : {}),
    },
  });

  if (!session.url) {
    return NextResponse.json({ error: "Could not start checkout." }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
