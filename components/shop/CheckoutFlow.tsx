"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { RegisterForm } from "@/components/registration/RegisterForm";
import { PaymentPlanPicker } from "@/components/payments/PaymentPlanPicker";
import { StripePayButton } from "@/components/payments/StripePayButton";
import { useCart } from "@/components/cart/CartProvider";
import { formatUsd } from "@/lib/cart/products";
import type { PaymentPlan } from "@/lib/payments/types";
import type { ClientRegistration } from "@/lib/registration/types";
import { site } from "@/content/site";

type CheckoutFlowProps = {
  registration: ClientRegistration | null;
  paymentsReady: boolean;
};

export function CheckoutFlow({ registration, paymentsReady }: CheckoutFlowProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lines, subtotalCents, hydrated, setQuantity, removeItem, clearCart } = useCart();
  const [fulfillmentNote, setFulfillmentNote] = useState("");
  const [paymentPlan, setPaymentPlan] = useState<PaymentPlan>("full");
  const successParam = searchParams.get("success") === "1";
  const sessionId = searchParams.get("session_id");
  const canceled = searchParams.get("canceled") === "1";
  const [confirmed, setConfirmed] = useState(false);
  const [confirmError, setConfirmError] = useState("");
  const success = successParam || confirmed;

  useEffect(() => {
    if (!successParam || !sessionId || confirmed) return;
    fetch("/api/orders/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then(async (res) => {
        if (res.ok) {
          setConfirmed(true);
          clearCart();
          return;
        }
        const data = (await res.json()) as { error?: string };
        setConfirmError(data.error ?? "Could not confirm payment.");
      })
      .catch(() => setConfirmError("Could not confirm payment."));
  }, [successParam, sessionId, confirmed, clearCart]);

  useEffect(() => {
    if (success && !sessionId) clearCart();
  }, [success, sessionId, clearCart]);

  useEffect(() => {
    if (hydrated && lines.length === 0 && !success) {
      router.replace("/shop");
    }
  }, [hydrated, lines.length, success, router]);

  if (!hydrated) {
    return <p className="prose-content text-muted">Loading your cart…</p>;
  }

  if (lines.length === 0 && !success) {
    return null;
  }

  if (success) {
    return (
      <div className="space-y-6">
        {confirmError ? (
          <p className="card border-[var(--rasta-red)] p-4 text-sm text-[var(--rasta-red)]" role="alert">
            {confirmError}
          </p>
        ) : null}
        <p className="card border-[var(--rasta-green)] p-5 text-sm leading-relaxed" role="status">
          Thank you for your order. Payment was successful. We will follow up about pickup or shipping.
        </p>
        <Link href="/shop" className="link-accent text-sm font-medium hover:underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {canceled ? (
        <p className="card p-4 text-sm text-muted" role="status">
          Checkout was canceled. Your cart is still here when you are ready.
        </p>
      ) : null}

      <section aria-labelledby="checkout-cart-heading">
        <h2 id="checkout-cart-heading" className="font-display text-2xl font-medium text-[var(--foreground)]">
          Your cart
        </h2>
        <ul className="mt-6 space-y-4">
          {lines.map((line) => (
            <li key={line.slug} className="card flex gap-4 p-4 sm:gap-6">
              <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-md bg-surface-muted sm:h-24 sm:w-20">
                <Image src={line.imageSrc} alt="" fill sizes="80px" className="object-cover" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-[var(--foreground)]">{line.name}</p>
                <p className="text-sm text-muted">{formatUsd(line.priceCents)} each</p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <label htmlFor={`qty-${line.slug}`} className="flex items-center gap-2 text-sm">
                    <span className="text-muted">Qty</span>
                    <input
                      id={`qty-${line.slug}`}
                      type="number"
                      min={1}
                      max={99}
                      inputMode="numeric"
                      aria-label={`Quantity for ${line.name}`}
                      value={line.quantity}
                      onChange={(e) => setQuantity(line.slug, Number(e.target.value))}
                      className="form-control w-20 max-w-full py-1.5 text-center"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => removeItem(line.slug)}
                    className="min-h-11 rounded-sm px-2 text-sm font-medium text-[var(--rasta-red)] outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[var(--rasta-gold)] focus-visible:ring-offset-2"
                  >
                    Remove {line.name}
                  </button>
                </div>
              </div>
              <p className="shrink-0 font-medium text-[var(--rasta-green)]">{formatUsd(line.lineTotalCents)}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-right text-lg font-semibold text-[var(--foreground)]">
          Subtotal <span className="text-[var(--rasta-green)]">{formatUsd(subtotalCents)}</span>
          <span className="block text-xs font-normal text-muted">Excluding sales tax</span>
        </p>
      </section>

      {!registration ? (
        <section aria-labelledby="checkout-register-heading" className="border-t border-subtle pt-10">
          <h2 id="checkout-register-heading" className="font-display text-2xl font-medium text-[var(--foreground)]">
            {site.shop.checkoutRegistrationTitle}
          </h2>
          <p className="prose-content mt-3 max-w-2xl">{site.shop.checkoutRegistrationIntro}</p>
          <RegisterForm next="checkout" source="shop-checkout" />
        </section>
      ) : (
        <section aria-labelledby="checkout-complete-heading" className="border-t border-subtle pt-10">
          <h2 id="checkout-complete-heading" className="font-display text-2xl font-medium text-[var(--foreground)]">
            Payment
          </h2>
          <p className="card mt-4 p-4 text-sm text-[var(--foreground)]">
            Ordering as <strong>{registration.fullName}</strong> · {registration.email} · {registration.phone}
          </p>
          <label htmlFor="fulfillment-note" className="mt-6 block text-sm font-semibold text-[var(--foreground)]">
            Pickup or shipping preference
          </label>
          <textarea
            id="fulfillment-note"
            rows={3}
            value={fulfillmentNote}
            onChange={(e) => setFulfillmentNote(e.target.value)}
            placeholder="e.g. Pickup in Houston, or ship to…"
            className="form-control mt-2 max-w-xl"
          />
          {paymentsReady ? (
            <>
              <PaymentPlanPicker value={paymentPlan} onChange={setPaymentPlan} />
              <StripePayButton
                apiPath="/api/checkout/shop"
                body={{
                  items: lines.map((line) => ({ slug: line.slug, quantity: line.quantity })),
                  fulfillmentNote,
                }}
                registerNext="checkout"
                paymentPlan={paymentPlan}
                label={`Pay ${formatUsd(subtotalCents)}`}
              />
            </>
          ) : (
            <p className="mt-4 text-sm text-muted">
              Add <code className="text-xs">STRIPE_SECRET_KEY</code> to enable card checkout.
            </p>
          )}
        </section>
      )}

      <p className="text-sm">
        <Link href="/shop" className="link-accent font-medium hover:underline">
          ← Continue shopping
        </Link>
      </p>
    </div>
  );
}
