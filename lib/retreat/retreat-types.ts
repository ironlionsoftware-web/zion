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
export const COUPLES_RETREAT_SLUG = "couples-bonding-healing" as const;
export const GROUP_COUPLES_RETREAT_SLUG = "group-couples-bonding" as const;

export function getRetreatParticipantLimits(retreatTypeSlug: string): {
  minParticipants: number;
  maxParticipants: number;
} {
  const type = getRetreatType(retreatTypeSlug);
  const defaults = site.retreat.booking;
  return {
    minParticipants: type && "minParticipants" in type && type.minParticipants != null
      ? type.minParticipants
      : defaults.minParticipants,
    maxParticipants: type && "maxParticipants" in type && type.maxParticipants != null
      ? type.maxParticipants
      : defaults.maxParticipants,
  };
}
