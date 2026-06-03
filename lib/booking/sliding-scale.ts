import type { SlidingScale } from "@/content/site";
import { getBookableService } from "@/content/site";

export const CARD_READINGS_SLUG = "card-readings";

export function getServiceSlidingScale(serviceSlug: string): SlidingScale | undefined {
  const service = getBookableService(serviceSlug);
  return service?.slidingScale;
}

export function isSlidingScaleService(serviceSlug: string): boolean {
  return getServiceSlidingScale(serviceSlug) != null;
}

export function parseSlidingScaleAmount(value: unknown, scale: SlidingScale): number | null {
  const amountCents = Number(value);
  if (!Number.isInteger(amountCents) || amountCents < scale.minCents || amountCents > scale.maxCents) {
    return null;
  }
  return amountCents;
}

export function formatSlidingScaleRange(scale: SlidingScale): string {
  const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
  return `${fmt.format(scale.minCents / 100)} – ${fmt.format(scale.maxCents / 100)}`;
}
