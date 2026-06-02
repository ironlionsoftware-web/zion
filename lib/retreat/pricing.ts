import { site } from "@/content/site";
import { getRetreatType } from "./retreat-types";
import type { RetreatBooking } from "./types";

export type RetreatPriceQuote = {
  totalCents: number;
  depositCents: number;
  balanceCents: number;
};

export function defaultRetreatPrice(): RetreatPriceQuote {
  const { totalCents, depositCents, balanceCents } = site.retreat.booking;
  return { totalCents, depositCents, balanceCents };
}

export function priceFromTotal(totalCents: number): RetreatPriceQuote {
  const { depositCents } = site.retreat.booking;
  return {
    totalCents,
    depositCents,
    balanceCents: totalCents - depositCents,
  };
}

export function retreatHasDurationOptions(retreatTypeSlug: string): boolean {
  const type = getRetreatType(retreatTypeSlug);
  return Boolean(type && "durationOptions" in type && type.durationOptions.length > 0);
}

export function resolveRetreatPricing(
  retreatTypeSlug: string,
  durationSlug?: string,
):
  | {
      ok: true;
      totalCents: number;
      depositCents: number;
      balanceCents: number;
      durationSlug?: string;
      durationLabel?: string;
    }
  | { ok: false; error: string } {
  const type = getRetreatType(retreatTypeSlug);
  if (!type) {
    return { ok: false, error: "Please choose a retreat." };
  }

  if ("durationOptions" in type && type.durationOptions.length > 0) {
    const normalized = typeof durationSlug === "string" ? durationSlug.trim().toLowerCase() : "";
    const option = type.durationOptions.find((d) => d.slug === normalized);
    if (!option) {
      return { ok: false, error: "Please choose 2 weeks or 1 month for the fitness retreat." };
    }
    const quote = priceFromTotal(option.totalCents);
    return {
      ok: true,
      ...quote,
      durationSlug: option.slug,
      durationLabel: option.label,
    };
  }

  const durationLabel = "duration" in type && type.duration ? type.duration : undefined;
  return { ok: true, ...defaultRetreatPrice(), durationLabel };
}

export function retreatPricingForBooking(booking: RetreatBooking): RetreatPriceQuote {
  if (
    typeof booking.totalCents === "number" &&
    typeof booking.depositCents === "number" &&
    typeof booking.balanceCents === "number"
  ) {
    return {
      totalCents: booking.totalCents,
      depositCents: booking.depositCents,
      balanceCents: booking.balanceCents,
    };
  }
  return defaultRetreatPrice();
}

export function retreatDisplayLabel(booking: RetreatBooking): string {
  const base =
    booking.retreatTypeLabel ??
    (booking.retreatTypeSlug ? getRetreatType(booking.retreatTypeSlug)?.label : undefined) ??
    site.retreat.title;
  const duration =
    booking.retreatDurationLabel ??
    (booking.retreatTypeSlug
      ? (() => {
          const type = getRetreatType(booking.retreatTypeSlug!);
          return type && "duration" in type && type.duration ? type.duration : undefined;
        })()
      : undefined);
  if (duration) {
    return `${base}: ${duration}`;
  }
  return base;
}

function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export function formatRetreatPriceSummary(quote: RetreatPriceQuote): string {
  return `${formatUsd(quote.totalCents)} total · ${formatUsd(quote.depositCents)} deposit · ${formatUsd(quote.balanceCents)} balance`;
}
