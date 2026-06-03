import { getPractitioner, getPractitionerCalendlyUrl } from "@/lib/booking/practitioners";
import { serializeReikiAddOnSlugs } from "@/lib/booking/reiki-addon";
import { getBookableService, isCalendlyConfigured, site } from "@/content/site";
import type { ClientRegistration, RegisterNext } from "./types";

export function registerHref(
  next: RegisterNext,
  options?: {
    serviceSlug?: string;
    bookingId?: string;
    participantIndex?: number;
    practitionerSlug?: string;
    ceremonyMedicineSlug?: string;
    reikiAddOnSlugs?: readonly string[];
  },
): string {
  const params = new URLSearchParams({ next });
  if (options?.serviceSlug?.trim()) params.set("service", options.serviceSlug.trim());
  if (options?.bookingId?.trim()) params.set("booking", options.bookingId.trim());
  if (options?.participantIndex !== undefined) {
    params.set("participant", String(options.participantIndex));
  }
  if (options?.practitionerSlug?.trim()) {
    params.set("practitioner", options.practitionerSlug.trim());
  }
  if (options?.ceremonyMedicineSlug?.trim()) {
    params.set("ceremony", options.ceremonyMedicineSlug.trim());
  }
  const addonQuery = options?.reikiAddOnSlugs?.length
    ? serializeReikiAddOnSlugs(options.reikiAddOnSlugs)
    : "";
  if (addonQuery) params.set("addon", addonQuery);
  return `/register?${params.toString()}`;
}

export function calendlyUrlWithPrefill(reg: ClientRegistration, practitionerSlug?: string): string {
  const practitioner = practitionerSlug ? getPractitioner(practitionerSlug) : undefined;
  const base = practitioner ? getPractitionerCalendlyUrl(practitioner) : site.calendly.url.trim();
  const url = new URL(base);
  url.searchParams.set("name", reg.fullName);
  url.searchParams.set("email", reg.email);
  return url.toString();
}

function serviceCheckoutUrl(
  serviceSlug: string,
  options?: { practitionerSlug?: string; ceremonyMedicineSlug?: string; reikiAddOnSlugs?: readonly string[] },
): string {
  const url = new URL("/checkout/service", "http://local");
  url.searchParams.set("service", serviceSlug);
  if (options?.practitionerSlug) url.searchParams.set("practitioner", options.practitionerSlug);
  if (options?.ceremonyMedicineSlug) url.searchParams.set("ceremony", options.ceremonyMedicineSlug);
  const addonQuery = options?.reikiAddOnSlugs?.length ? serializeReikiAddOnSlugs(options.reikiAddOnSlugs) : "";
  if (addonQuery) url.searchParams.set("addon", addonQuery);
  return `${url.pathname}${url.search}`;
}

export function redirectAfterRegistration(
  next: RegisterNext,
  reg: ClientRegistration,
  options?: {
    serviceSlug?: string;
    bookingId?: string;
    participantIndex?: number;
    practitionerSlug?: string;
    ceremonyMedicineSlug?: string;
    reikiAddOnSlugs?: readonly string[];
  },
): { url: string; external: boolean } {
  switch (next) {
    case "donation":
      return { url: "/donation", external: false };
    case "shop":
      return { url: "/shop", external: false };
    case "checkout":
      return { url: "/shop/checkout", external: false };
    case "retreat": {
      const bookingId = options?.bookingId?.trim();
      if (bookingId) {
        const url = new URL(`/retreat/booking/${bookingId}`, "http://local");
        if (options?.participantIndex !== undefined) {
          url.searchParams.set("participant", String(options.participantIndex));
        }
        return { url: `${url.pathname}${url.search}`, external: false };
      }
      return { url: "/retreat/book", external: false };
    }
    case "book": {
      const service = options?.serviceSlug ? getBookableService(options.serviceSlug) : undefined;
      if (service) {
        return {
          url: serviceCheckoutUrl(service.slug, {
            practitionerSlug: options?.practitionerSlug,
            ceremonyMedicineSlug: options?.ceremonyMedicineSlug,
            reikiAddOnSlugs: options?.reikiAddOnSlugs,
          }),
          external: false,
        };
      }
      if (isCalendlyConfigured()) {
        return {
          url: calendlyUrlWithPrefill(reg, options?.practitionerSlug),
          external: true,
        };
      }
      return { url: "/contact", external: false };
    }
    case "contact":
    default:
      return { url: "/contact", external: false };
  }
}

export function parseRegisterNext(value: string | null | undefined): RegisterNext {
  if (
    value === "donation" ||
    value === "shop" ||
    value === "checkout" ||
    value === "retreat" ||
    value === "book" ||
    value === "contact"
  ) {
    return value;
  }
  return "book";
}
