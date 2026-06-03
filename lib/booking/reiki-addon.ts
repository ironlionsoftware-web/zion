import { site } from "@/content/site";

export type ReikiAddOnOption = (typeof site.healingServices.reikiAddOn.options)[number];

export const REIKI_SERVICE_SLUG = site.healingServices.reikiAddOn.serviceSlug;

export function isReikiService(serviceSlug: string | undefined): boolean {
  return serviceSlug?.trim() === REIKI_SERVICE_SLUG;
}

export function getReikiAddOnPriceCents(): number {
  return site.healingServices.reikiAddOn.priceCents;
}

export function getReikiAddOnOption(slug: string): ReikiAddOnOption | undefined {
  const normalized = slug.trim().toLowerCase();
  return site.healingServices.reikiAddOn.options.find((option) => option.slug === normalized);
}

/** Returns undefined when the client declines an add-on. */
export function parseReikiAddOnSlug(value: string | null | undefined): string | undefined {
  const slug = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (!slug || slug === "none") return undefined;
  return getReikiAddOnOption(slug) ? slug : undefined;
}
