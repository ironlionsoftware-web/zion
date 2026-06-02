import { site } from "@/content/site";

export type RetreatType = (typeof site.retreat.booking.types)[number];

export function getRetreatTypes(): readonly RetreatType[] {
  return site.retreat.booking.types;
}

export function getRetreatType(slug: string): RetreatType | undefined {
  const normalized = slug.trim().toLowerCase();
  return site.retreat.booking.types.find((t) => t.slug === normalized);
}

export function parseRetreatTypeSlug(value: string | null | undefined): string | undefined {
  const slug = typeof value === "string" ? value.trim().toLowerCase() : "";
  return getRetreatType(slug) ? slug : undefined;
}

export const FITNESS_RETREAT_SLUG = "holistic-fitness-vitality-weight-loss" as const;
