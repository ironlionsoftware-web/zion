"use client";

import { site } from "@/content/site";
import { formatUsd } from "@/lib/cart/products";
import { getReikiAddOnPriceCents } from "@/lib/booking/reiki-addon";

type ReikiAddOnPickerProps = {
  value: readonly string[];
  onChange: (slugs: string[]) => void;
  disabled?: boolean;
};

export function ReikiAddOnPicker({ value, onChange, disabled }: ReikiAddOnPickerProps) {
  const cfg = site.healingServices.reikiAddOn;
  const addOnPrice = getReikiAddOnPriceCents();
  const selected = new Set(value);

  function toggle(slug: string) {
    if (disabled) return;
    if (selected.has(slug)) {
      onChange(value.filter((s) => s !== slug));
    } else {
      onChange([...value, slug]);
    }
  }

  return (
    <fieldset className="mt-6" disabled={disabled}>
      <legend className="text-sm font-semibold text-[var(--foreground)]">{cfg.legend}</legend>
      <p className="mt-2 text-sm text-muted">{cfg.lead}</p>
      {value.length > 0 ? (
        <p className="mt-2 text-sm font-medium text-[var(--rasta-green)]">
          {value.length} selected · +{formatUsd(value.length * addOnPrice)} total add-ons
        </p>
      ) : (
        <p className="mt-2 text-sm text-muted">{cfg.noneSummary}</p>
      )}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {cfg.options.map((option) => {
          const checked = selected.has(option.slug);
          return (
            <label
              key={option.slug}
              className={`card cursor-pointer p-4 transition has-focus-visible:ring-2 has-focus-visible:ring-[var(--rasta-gold)] has-focus-visible:ring-offset-2 ${checked ? "border-[var(--rasta-green)] ring-1 ring-[var(--rasta-green)]" : ""} ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
            >
              <input
                type="checkbox"
                name="reiki-addon"
                value={option.slug}
                checked={checked}
                onChange={() => toggle(option.slug)}
                className="sr-only"
              />
              <span className="block font-medium text-[var(--foreground)]">
                {option.label}{" "}
                <span className="font-normal text-[var(--rasta-green)]">+{formatUsd(addOnPrice)}</span>
              </span>
              <span className="mt-1 block text-xs text-muted">{option.summary}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
