"use client";

import { site } from "@/content/site";
import { formatRetreatUsd } from "@/lib/retreat/booking";
import { getRetreatTypes } from "@/lib/retreat/retreat-types";

type RetreatTypePickerProps = {
  value: string;
  onChange: (slug: string) => void;
  disabled?: boolean;
  name?: string;
};

export function RetreatTypePicker({ value, onChange, disabled, name = "retreat-type" }: RetreatTypePickerProps) {
  const cfg = site.retreat.booking;
  const types = getRetreatTypes();

  return (
    <fieldset disabled={disabled}>
      <legend className="text-sm font-semibold text-[var(--foreground)]">{cfg.retreatTypeLegend}</legend>
      <p className="mt-2 text-sm text-muted">{cfg.retreatTypeLead}</p>
      <div className="mt-4 grid gap-3">
        {types.map((type) => (
          <label
            key={type.slug}
            className={`card cursor-pointer p-4 transition has-focus-visible:ring-2 has-focus-visible:ring-[var(--rasta-gold)] has-focus-visible:ring-offset-2 ${value === type.slug ? "border-[var(--rasta-green)] ring-1 ring-[var(--rasta-green)]" : ""} ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
          >
            <input
              type="radio"
              name={name}
              value={type.slug}
              checked={value === type.slug}
              onChange={() => onChange(type.slug)}
              className="sr-only"
            />
            <span className="block font-medium text-[var(--foreground)]">{type.label}</span>
            {type.summary ? <span className="mt-1 block text-xs text-muted">{type.summary}</span> : null}
            {"durationOptions" in type && type.durationOptions.length > 0 ? (
              <span className="mt-1 block text-xs font-medium text-[var(--rasta-green)]">
                {type.durationOptions
                  .map((d) => `${d.label} ${formatRetreatUsd(d.totalCents)}`)
                  .join(" · ")}
              </span>
            ) : "totalCents" in type && typeof type.totalCents === "number" ? (
              <span className="mt-1 block text-xs font-medium text-[var(--rasta-green)]">
                {"duration" in type && type.duration ? `${type.duration} · ` : ""}
                {formatRetreatUsd(type.totalCents)} per person · all-inclusive
              </span>
            ) : "duration" in type && type.duration ? (
              <span className="mt-1 block text-xs font-medium text-[var(--rasta-green)]">
                {type.duration} · {formatRetreatUsd(site.retreat.booking.totalCents)} all-inclusive
              </span>
            ) : null}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
