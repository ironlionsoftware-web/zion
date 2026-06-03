"use client";

import { useState } from "react";
import { registerHref } from "@/lib/registration/redirect";
import type { PaymentPlan } from "@/lib/payments/types";
import type { RegisterNext } from "@/lib/registration/types";

type StripePayButtonProps = {
  apiPath: string;
  body: Record<string, unknown>;
  registerNext: RegisterNext;
  registerOptions?: {
    bookingId?: string;
    participantIndex?: number;
    serviceSlug?: string;
    practitionerSlug?: string;
    ceremonyMedicineSlug?: string;
    reikiAddOnSlugs?: string[];
  };
  label?: string;
  paymentPlan: PaymentPlan;
  disabled?: boolean;
  onSuccessRedirect?: () => void;
};

export function StripePayButton({
  apiPath,
  body,
  registerNext,
  registerOptions,
  label = "Pay with card",
  paymentPlan,
  disabled,
  onSuccessRedirect,
}: StripePayButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, paymentPlan }),
      });
      const data = (await res.json()) as { url?: string; error?: string; code?: string };

      if (res.status === 401 || data.code === "registration_required") {
        window.location.assign(registerHref(registerNext, registerOptions));
        return;
      }

      if (!res.ok || !data.url) {
        setError(data.error ?? "Could not start checkout. Please try again.");
        return;
      }

      onSuccessRedirect?.();
      window.location.href = data.url;
    } catch {
      setError("Could not reach the payment server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handlePay}
        disabled={disabled || loading}
        className="btn btn-primary mt-6 w-full max-w-md disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Redirecting to secure checkout…" : label}
      </button>
      {error ? (
        <p className="mt-3 text-sm text-[var(--rasta-red)]" role="alert">
          {error}
        </p>
      ) : null}
      <p className="mt-3 max-w-md text-xs text-muted">
        Secure payment powered by Stripe. Installment options (Klarna, Affirm) appear at checkout when eligible.
      </p>
    </div>
  );
}
