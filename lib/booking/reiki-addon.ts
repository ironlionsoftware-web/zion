import { site } from "@/content/site";

export type ReikiAddOnOption = (typeof site.healingServices.reikiAddOn.options)[number];

export const REIKI_SERVICE_SLUG = site.healingServices.reikiAddOn.serviceSlug;

const ADDON_QUERY_SEPARATOR = ",";

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

export function resolveReikiAddOns(slugs: readonly string[]): ReikiAddOnOption[] {
  const seen = new Set<string>();
  const resolved: ReikiAddOnOption[] = [];
  for (const slug of slugs) {
    const option = getReikiAddOnOption(slug);
    if (!option || seen.has(option.slug)) continue;
    seen.add(option.slug);
    resolved.push(option);
  }
  return resolved;
}

export function computeReikiAddOnTotalCents(slugs: readonly string[]): number {
  return resolveReikiAddOns(slugs).length * getReikiAddOnPriceCents();
}

export function serializeReikiAddOnSlugs(slugs: readonly string[]): string {
  return resolveReikiAddOns(slugs)
    .map((option) => option.slug)
    .join(ADDON_QUERY_SEPARATOR);
}

/** Parse comma-separated or single slug from URL / legacy payloads. */
export function parseReikiAddOnSlugs(value: string | string[] | null | undefined): string[] {
  if (Array.isArray(value)) {
    return resolveReikiAddOns(value).map((option) => option.slug);
  }
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw || raw === "none") return [];
  return resolveReikiAddOns(raw.split(ADDON_QUERY_SEPARATOR)).map((option) => option.slug);
}

/** @deprecated Use parseReikiAddOnSlugs — first slug only for backward compatibility. */
export function parseReikiAddOnSlug(value: string | null | undefined): string | undefined {
  return parseReikiAddOnSlugs(value)[0];
}
