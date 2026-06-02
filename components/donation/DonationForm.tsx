"use client";

import { useState } from "react";
import { PaymentPlanPicker } from "@/components/payments/PaymentPlanPicker";
import { StripePayButton } from "@/components/payments/StripePayButton";
import { site } from "@/content/site";
import type { PaymentPlan } from "@/lib/payments/types";

type DonationFormProps = {
  paymentsReady: boolean;
};

function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export function DonationForm({ paymentsReady }: DonationFormProps) {
  const { minCents, maxCents, defaultCents } = site.donation;
  const [amountCents, setAmountCents] = useState<number>(defaultCents);
  const [paymentPlan, setPaymentPlan] = useState<PaymentPlan>("full");

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="card mt-10 max-w-lg p-6 sm:p-8"
    >
      <label htmlFor="donation-amount" className="block text-sm font-semibold text-[var(--foreground)]">
        Your contribution
      </label>
      <p id="donation-amount-display" className="mt-2 font-display text-3xl font-medium text-[var(--rasta-green)]">
        {formatUsd(amountCents)}
      </p>
      <input
        id="donation-amount"
        type="range"
        min={minCents}
        max={maxCents}
        step={500}
        value={amountCents}
        onChange={(e) => setAmountCents(Number(e.target.value))}
        className="mt-6 w-full accent-[var(--rasta-green)]"
        aria-valuemin={minCents / 100}
        aria-valuemax={maxCents / 100}
        aria-valuenow={amountCents / 100}
        aria-describedby="donation-range-hint"
        disabled={!paymentsReady}
      />
      <p id="donation-range-hint" className="mt-2 flex justify-between text-xs text-muted">
        <span>{formatUsd(minCents)}</span>
        <span>{formatUsd(maxCents)}</span>
      </p>

      {!paymentsReady ? (
        <p className="mt-6 text-sm leading-relaxed text-muted">
          Online payment is being set up. Add <code className="text-xs">STRIPE_SECRET_KEY</code> to your environment.
        </p>
      ) : (
        <>
          <PaymentPlanPicker value={paymentPlan} onChange={setPaymentPlan} />
          <StripePayButton
            apiPath="/api/checkout/donation"
            body={{ amountCents }}
            registerNext="donation"
            paymentPlan={paymentPlan}
            label={`Donate ${formatUsd(amountCents)}`}
          />
        </>
      )}
    </form>
  );
}
