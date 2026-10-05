/**
 * Central content and site configuration.
 *
 * This file is the stable import surface for the whole app — everything still
 * does `import { site } from "@/content/site"`. What changed is where the
 * VALUES come from: they now live in `tenants/<slug>/content.ts`, chosen at
 * build time by the TENANT env var (see next.config.ts).
 *
 * Put shared types in `content/types.ts` and business data in the tenant
 * directory. Nothing business-specific belongs in this file.
 */

export type {
  NavItem,
  Service,
  ShopProductVariant,
  ShopProductOptionChoice,
  ShopProductOptionGroup,
  ShopProduct,
  HealingServiceItem,
  SlidingScale,
  BookableService,
  ClassOffering,
  NaturePhoto,
} from "@/content/types";

import type { HealingServiceItem, BookableService, Service } from "@/content/types";
import {
  site,
  services,
  shopProducts,
  retreatPhotos,
  homeLandscapePhotos,
  natureGalleryPhotos,
} from "@/tenants/active";

export { site, services, shopProducts, retreatPhotos, homeLandscapePhotos, natureGalleryPhotos };

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}

export function getServiceSlugs(): { slug: string }[] {
  // Entries that link elsewhere get no generated page, so a thin stub never
  // competes with the real page for the same search.
  return services.filter((s) => !s.href).map((s) => ({ slug: s.slug }));
}

/** True when `site.calendly.url` is a real Calendly link (not empty / placeholder). */
export function isCalendlyConfigured(): boolean {
  const url = site.calendly.url.trim();
  return url.length > 0 && /^https:\/\/calendly\.com\/.+/i.test(url);
}

export function healingServiceHref(item: HealingServiceItem): string {
  if (item.kind === "shop") return "/shop";
  if (item.kind === "classes") return "/healing-services/classes";
  const next = item.kind === "donation" ? "donation" : "book";
  const params = new URLSearchParams({ next, service: item.slug });
  return `/register?${params.toString()}`;
}

export function getBookableService(slug: string): BookableService | undefined {
  const classSlug = slug.startsWith("class-") ? slug.slice("class-".length) : undefined;
  if (classSlug) {
    const offering = site.healingServices.classCatalog.classes.find((c) => c.slug === classSlug);
    if (!offering) return undefined;
    return {
      slug,
      label: offering.title,
      kind: "book",
      priceCents: offering.priceCents,
    };
  }

  if (slug === site.fitnessTraining.booking.serviceSlug) {
    const { serviceLabel, slidingScale } = site.fitnessTraining.booking;
    return {
      slug: site.fitnessTraining.booking.serviceSlug,
      label: serviceLabel,
      kind: "book",
      priceCents: slidingScale.defaultCents,
      slidingScale,
    };
  }

  const item = site.healingServices.services.find((s) => s.slug === slug && s.kind === "book");
  if (!item) return undefined;

  if (item.slidingScale) {
    return {
      ...item,
      priceCents: item.slidingScale.defaultCents,
      slidingScale: item.slidingScale,
    };
  }

  if (typeof item.priceCents !== "number") return undefined;
  return item as BookableService;
}
