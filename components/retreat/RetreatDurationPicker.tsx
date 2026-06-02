"use client";

import { site } from "@/content/site";
import { formatRetreatUsd } from "@/lib/retreat/booking";
import { priceFromTotal } from "@/lib/retreat/pricing";
import { getRetreatType } from "@/lib/retreat/retreat-types";

type RetreatDurationPickerProps = {
  retreatTypeSlug: string;
  value: string;
  onChange: (slug: string) => void;
  disabled?: boolean;
};

export function RetreatDurationPicker({
  retreatTypeSlug,
  value,
  onChange,
  disabled,
}: RetreatDurationPickerProps) {
  const cfg = site.retreat.booking;
  const type = getRetreatType(retreatTypeSlug);
  if (!type || !("durationOptions" in type)) return null;

  return (
    <fieldset className="mt-6" disabled={disabled}>
      <legend className="text-sm font-semibold text-[var(--foreground)]">{cfg.durationLegend}</legend>
      <p className="mt-2 text-sm text-muted">{cfg.durationLead}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {type.durationOptions.map((option) => {
          const quote = priceFromTotal(option.totalCents);
          return (
            <label
              key={option.slug}
              className={`card cursor-pointer p-4 transition has-focus-visible:ring-2 has-focus-visible:ring-[var(--rasta-gold)] has-focus-visible:ring-offset-2 ${value === option.slug ? "border-[var(--rasta-green)] ring-1 ring-[var(--rasta-green)]" : ""} ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
            >
              <input
                type="radio"
                name="retreat-duration"
                value={option.slug}
                checked={value === option.slug}
                onChange={() => onChange(option.slug)}
                className="sr-only"
              />
              <span className="block font-medium text-[var(--foreground)]">{option.label}</span>
              <span className="mt-1 block text-sm text-[var(--rasta-green)]">
                {formatRetreatUsd(option.totalCents)} all inclusive
              </span>
              <span className="mt-1 block text-xs text-muted">
                {formatRetreatUsd(quote.depositCents)} deposit · {formatRetreatUsd(quote.balanceCents)} balance
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
