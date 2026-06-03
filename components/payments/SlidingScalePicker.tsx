"use client";

import { formatUsd } from "@/lib/cart/products";
import type { SlidingScale } from "@/content/site";

type SlidingScalePickerProps = {
  scale: SlidingScale;
  valueCents: number;
  onChange: (cents: number) => void;
  disabled?: boolean;
  label?: string;
  id?: string;
};

export function SlidingScalePicker({
  scale,
  valueCents,
  onChange,
  disabled,
  label = "Your contribution",
  id = "sliding-scale-amount",
}: SlidingScalePickerProps) {
  return (
    <div className="mt-6">
      <label htmlFor={id} className="block text-sm font-semibold text-[var(--foreground)]">
        {label}
      </label>
      <p id={`${id}-display`} className="mt-2 font-display text-3xl font-medium text-[var(--rasta-green)]">
        {formatUsd(valueCents)}
      </p>
      <input
        id={id}
        type="range"
        min={scale.minCents}
        max={scale.maxCents}
        step={500}
        value={valueCents}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-6 w-full accent-[var(--rasta-green)]"
        aria-valuemin={scale.minCents / 100}
        aria-valuemax={scale.maxCents / 100}
        aria-valuenow={valueCents / 100}
        aria-describedby={`${id}-hint`}
        disabled={disabled}
      />
      <p id={`${id}-hint`} className="mt-2 flex justify-between text-xs text-muted">
        <span>{formatUsd(scale.minCents)}</span>
        <span>{formatUsd(scale.maxCents)}</span>
      </p>
    </div>
  );
}
