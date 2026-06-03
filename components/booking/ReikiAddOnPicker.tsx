"use client";

import { site } from "@/content/site";
import { formatUsd } from "@/lib/cart/products";
import { getReikiAddOnPriceCents } from "@/lib/booking/reiki-addon";

type ReikiAddOnPickerProps = {
  value: string;
  onChange: (slug: string) => void;
  disabled?: boolean;
  name?: string;
};

export function ReikiAddOnPicker({
  value,
  onChange,
  disabled,
  name = "reiki-addon",
}: ReikiAddOnPickerProps) {
  const cfg = site.healingServices.reikiAddOn;
  const addOnPrice = getReikiAddOnPriceCents();

  return (
    <fieldset className="mt-6" disabled={disabled}>
      <legend className="text-sm font-semibold text-[var(--foreground)]">{cfg.legend}</legend>
      <p className="mt-2 text-sm text-muted">{cfg.lead}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label
          className={`card cursor-pointer p-4 transition has-focus-visible:ring-2 has-focus-visible:ring-[var(--rasta-gold)] has-focus-visible:ring-offset-2 sm:col-span-2 ${value === "" ? "border-[var(--rasta-green)] ring-1 ring-[var(--rasta-green)]" : ""} ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
        >
          <input
            type="radio"
            name={name}
            value=""
            checked={value === ""}
            onChange={() => onChange("")}
            className="sr-only"
          />
          <span className="block font-medium text-[var(--foreground)]">{cfg.noneLabel}</span>
          <span className="mt-1 block text-xs text-muted">{cfg.noneSummary}</span>
        </label>
        {cfg.options.map((option) => (
          <label
            key={option.slug}
            className={`card cursor-pointer p-4 transition has-focus-visible:ring-2 has-focus-visible:ring-[var(--rasta-gold)] has-focus-visible:ring-offset-2 ${value === option.slug ? "border-[var(--rasta-green)] ring-1 ring-[var(--rasta-green)]" : ""} ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
          >
            <input
              type="radio"
              name={name}
              value={option.slug}
              checked={value === option.slug}
              onChange={() => onChange(option.slug)}
              className="sr-only"
            />
            <span className="block font-medium text-[var(--foreground)]">
              {option.label}{" "}
              <span className="font-normal text-[var(--rasta-green)]">+{formatUsd(addOnPrice)}</span>
            </span>
            <span className="mt-1 block text-xs text-muted">{option.summary}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
