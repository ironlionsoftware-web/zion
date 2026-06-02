"use client";

import { site } from "@/content/site";
import type { PaymentPlan } from "@/lib/payments/types";

type PaymentPlanPickerProps = {
  value: PaymentPlan;
  onChange: (plan: PaymentPlan) => void;
  disabled?: boolean;
};

export function PaymentPlanPicker({ value, onChange, disabled }: PaymentPlanPickerProps) {
  const p = site.payments;

  return (
    <fieldset className="mt-6" disabled={disabled}>
      <legend className="text-sm font-semibold text-[var(--foreground)]">{p.planLegend}</legend>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label
          className={`card cursor-pointer p-4 transition has-focus-visible:ring-2 has-focus-visible:ring-[var(--rasta-gold)] has-focus-visible:ring-offset-2 ${value === "full" ? "border-[var(--rasta-green)] ring-1 ring-[var(--rasta-green)]" : ""} ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
        >
          <input
            type="radio"
            name="payment-plan"
            value="full"
            checked={value === "full"}
            onChange={() => onChange("full")}
            className="sr-only"
          />
          <span className="block font-medium text-[var(--foreground)]">{p.payInFullLabel}</span>
          <span className="mt-1 block text-xs text-muted">{p.payInFullHint}</span>
        </label>
        <label
          className={`card cursor-pointer p-4 transition has-focus-visible:ring-2 has-focus-visible:ring-[var(--rasta-gold)] has-focus-visible:ring-offset-2 ${value === "installments" ? "border-[var(--rasta-green)] ring-1 ring-[var(--rasta-green)]" : ""} ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
        >
          <input
            type="radio"
            name="payment-plan"
            value="installments"
            checked={value === "installments"}
            onChange={() => onChange("installments")}
            className="sr-only"
          />
          <span className="block font-medium text-[var(--foreground)]">{p.installmentsLabel}</span>
          <span className="mt-1 block text-xs text-muted">{p.installmentsHint}</span>
        </label>
      </div>
    </fieldset>
  );
}
