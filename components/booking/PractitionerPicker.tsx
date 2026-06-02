"use client";

import { site } from "@/content/site";
import { formatUsd } from "@/lib/cart/products";
import {
  DUAL_PRACTITIONER_SLUG,
  getDualSessionConfig,
  getPractitioners,
} from "@/lib/booking/practitioners";

type PractitionerPickerProps = {
  value: string;
  onChange: (slug: string) => void;
  disabled?: boolean;
  name?: string;
  /** Base single-practitioner price — used to show dual session total when applicable */
  basePriceCents?: number;
};

export function PractitionerPicker({
  value,
  onChange,
  disabled,
  name = "practitioner",
  basePriceCents,
}: PractitionerPickerProps) {
  const p = site.practitioners;
  const practitioners = getPractitioners();
  const dual = getDualSessionConfig();
  const dualPriceCents =
    basePriceCents != null ? Math.round(basePriceCents * dual.priceMultiplier) : undefined;

  return (
    <fieldset className="mt-6" disabled={disabled}>
      <legend className="text-sm font-semibold text-[var(--foreground)]">{p.legend}</legend>
      <p className="mt-2 text-sm text-muted">{p.lead}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {practitioners.map((practitioner) => (
          <label
            key={practitioner.slug}
            className={`card cursor-pointer p-4 transition has-focus-visible:ring-2 has-focus-visible:ring-[var(--rasta-gold)] has-focus-visible:ring-offset-2 ${value === practitioner.slug ? "border-[var(--rasta-green)] ring-1 ring-[var(--rasta-green)]" : ""} ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
          >
            <input
              type="radio"
              name={name}
              value={practitioner.slug}
              checked={value === practitioner.slug}
              onChange={() => onChange(practitioner.slug)}
              className="sr-only"
            />
            <span className="block font-medium text-[var(--foreground)]">{practitioner.name}</span>
            <span className="mt-1 block text-xs text-muted">{practitioner.title}</span>
          </label>
        ))}
        <label
          className={`card cursor-pointer p-4 transition has-focus-visible:ring-2 has-focus-visible:ring-[var(--rasta-gold)] has-focus-visible:ring-offset-2 sm:col-span-2 ${value === DUAL_PRACTITIONER_SLUG ? "border-[var(--rasta-green)] ring-1 ring-[var(--rasta-green)]" : "border-[var(--rasta-gold)]/40"}`}
        >
          <input
            type="radio"
            name={name}
            value={DUAL_PRACTITIONER_SLUG}
            checked={value === DUAL_PRACTITIONER_SLUG}
            onChange={() => onChange(DUAL_PRACTITIONER_SLUG)}
            className="sr-only"
            disabled={disabled}
          />
          <span className="block font-medium text-[var(--foreground)]">{dual.name}</span>
          <span className="mt-1 block text-xs text-muted">{dual.title}</span>
          <p className="mt-2 text-xs leading-relaxed text-muted">{dual.description}</p>
          {dualPriceCents != null ? (
            <p className="mt-2 text-sm font-medium text-[var(--rasta-green)]">
              {formatUsd(dualPriceCents)}
              <span className="ml-1 font-normal text-muted">
                ({dual.priceMultiplier}× single session)
              </span>
            </p>
          ) : null}
        </label>
      </div>
    </fieldset>
  );
}
