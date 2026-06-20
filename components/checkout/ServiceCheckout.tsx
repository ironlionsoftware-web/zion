"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CeremonyMedicinePicker } from "@/components/booking/CeremonyMedicinePicker";
import { ReikiAddOnPicker } from "@/components/booking/ReikiAddOnPicker";
import { PractitionerPicker } from "@/components/booking/PractitionerPicker";
import { getClassOfferingFromServiceSlug, isClassService } from "@/lib/booking/classes";
import {
  getCeremonyMedicine,
  getCeremonyMedicineOptions,
  isPlantMedicineCeremonyService,
} from "@/lib/booking/ceremony-medicine";
import {
  computeReikiAddOnTotalCents,
  getReikiAddOnPriceCents,
  isReikiService,
  resolveReikiAddOns,
} from "@/lib/booking/reiki-addon";
import { PaymentPlanPicker } from "@/components/payments/PaymentPlanPicker";
import { SlidingScalePicker } from "@/components/payments/SlidingScalePicker";
import { StripePayButton } from "@/components/payments/StripePayButton";
import { FitnessTrainerPicker } from "@/components/fitness/FitnessTrainerPicker";
import {
  computeServiceCheckoutCents,
  getPractitioner,
  getPractitioners,
  isDualPractitionerSlug,
} from "@/lib/booking/practitioners";
import { getFitnessTrainers, isFitnessTrainingService } from "@/lib/booking/fitness-trainers";
import { formatSlidingScaleRange } from "@/lib/booking/sliding-scale";
import { calendlyUrlWithPrefill } from "@/lib/registration/redirect";
import { formatUsd } from "@/lib/cart/products";
import type { PaymentPlan } from "@/lib/payments/types";
import type { ClientRegistration } from "@/lib/registration/types";
import type { SlidingScale } from "@/content/site";
import { site } from "@/content/site";

type ServiceCheckoutProps = {
  serviceSlug: string;
  serviceLabel: string;
  priceCents: number;
  slidingScale?: SlidingScale;
  registration: ClientRegistration;
  paymentsReady: boolean;
  success: boolean;
  canceled: boolean;
  initialPractitioner?: string;
  initialCeremonyMedicine?: string;
  initialReikiAddOns?: readonly string[];
};

export function ServiceCheckout({
  serviceSlug,
  serviceLabel,
  priceCents,
  slidingScale,
  registration,
  paymentsReady,
  success: successProp,
  canceled,
  initialPractitioner,
  initialCeremonyMedicine,
  initialReikiAddOns,
}: ServiceCheckoutProps) {
  const isClass = isClassService(serviceSlug);
  const isFitnessBooking = isFitnessTrainingService(serviceSlug);
  const classOffering = getClassOfferingFromServiceSlug(serviceSlug);
  const showCeremonyPicker = isPlantMedicineCeremonyService(serviceSlug);
  const showReikiAddOnPicker = isReikiService(serviceSlug);
  const showPractitionerPicker = !isClass && !isFitnessBooking;
  const showFitnessTrainerPicker = isFitnessBooking;
  const ceremonyOptions = getCeremonyMedicineOptions();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [confirmed, setConfirmed] = useState(false);
  const [confirmError, setConfirmError] = useState("");
  const success = successProp || confirmed;

  useEffect(() => {
    if (!successProp || !sessionId || confirmed) return;
    fetch("/api/orders/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then(async (res) => {
        if (res.ok) {
          setConfirmed(true);
          return;
        }
        const data = (await res.json()) as { error?: string };
        setConfirmError(data.error ?? "Could not confirm payment.");
      })
      .catch(() => setConfirmError("Could not confirm payment."));
  }, [successProp, sessionId, confirmed]);

  const [paymentPlan, setPaymentPlan] = useState<PaymentPlan>("full");
  const [slidingAmountCents, setSlidingAmountCents] = useState<number>(
    slidingScale?.defaultCents ?? priceCents,
  );
  const [practitioner, setPractitioner] = useState<string>(
    initialPractitioner ??
      (isFitnessBooking ? getFitnessTrainers()[0]?.slug : getPractitioners()[0]?.slug) ??
      "",
  );
  const [ceremonyMedicine, setCeremonyMedicine] = useState<string>(
    showCeremonyPicker ? (initialCeremonyMedicine ?? ceremonyOptions[0]?.slug ?? "") : "",
  );
  const [reikiAddOns, setReikiAddOns] = useState<string[]>([...(initialReikiAddOns ?? [])]);
  const practitionerRecord = getPractitioner(practitioner);
  const ceremonyMedicineRecord = showCeremonyPicker ? getCeremonyMedicine(ceremonyMedicine) : undefined;
  const reikiAddOnRecords = resolveReikiAddOns(reikiAddOns);
  const baseCheckoutCents = slidingScale
    ? slidingAmountCents
    : showPractitionerPicker
      ? computeServiceCheckoutCents(priceCents, practitioner)
      : priceCents;
  const checkoutPriceCents = baseCheckoutCents + computeReikiAddOnTotalCents(reikiAddOns);
  const isDual = isDualPractitionerSlug(practitioner);
  const p = site.payments;

  return (
    <div className="space-y-10">
      {confirmError ? (
        <p className="card border-[var(--rasta-red)] p-4 text-sm text-[var(--rasta-red)]" role="alert">
          {confirmError}
        </p>
      ) : null}
      {success ? (
        <p className="card border-[var(--rasta-green)] p-5 text-sm leading-relaxed" role="status">
          {isClass ? (
            p.classSuccessHint
          ) : (
            <>
              {p.serviceSuccessHint}{" "}
              {registration && site.calendly.url && practitioner ? (
                <a
                  href={calendlyUrlWithPrefill(registration, practitioner)}
                  className="link-accent font-semibold hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {isDual ? "Schedule your dual session" : `Schedule with ${practitionerRecord?.name ?? "your practitioner"}`} on Calendly →
                </a>
              ) : null}
            </>
          )}
        </p>
      ) : null}
      {canceled ? (
        <p className="card p-4 text-sm text-muted" role="status">
          Payment was canceled. You can try again when ready.
        </p>
      ) : null}

      <section className="card p-6 sm:p-8">
        <h2 className="font-display text-xl font-medium text-[var(--foreground)]">{serviceLabel}</h2>
        {slidingScale ? (
          <>
            <p className="mt-2 text-lg font-medium text-[var(--rasta-green)]">
              {formatSlidingScaleRange(slidingScale)} sliding scale
            </p>
            <p className="mt-1 text-xs text-muted">Choose what fits your situation</p>
          </>
        ) : (
          <>
            <p className="mt-2 text-2xl font-medium text-[var(--rasta-green)]">{formatUsd(checkoutPriceCents)}</p>
            {isDual && baseCheckoutCents !== priceCents ? (
              <p className="mt-1 text-xs text-muted">
                Dual session ({site.practitioners.dualSession.priceMultiplier}× single practitioner rate)
              </p>
            ) : (
              <p className="mt-1 text-xs text-muted">Excluding sales tax where applicable</p>
            )}
          </>
        )}
        {practitionerRecord ? (
          <p className="mt-3 text-sm text-muted">
            With <strong className="text-[var(--foreground)]">{practitionerRecord.name}</strong> ·{" "}
            {practitionerRecord.title}
          </p>
        ) : null}
        {ceremonyMedicineRecord ? (
          <p className="mt-2 text-sm text-muted">
            Ceremony: <strong className="text-[var(--foreground)]">{ceremonyMedicineRecord.label}</strong>
          </p>
        ) : null}
        {reikiAddOnRecords.length > 0 ? (
          <div className="mt-2 text-sm text-muted">
            <p>
              Add-ons ({formatUsd(computeReikiAddOnTotalCents(reikiAddOns))} ·{" "}
              {formatUsd(getReikiAddOnPriceCents())} each):
            </p>
            <ul className="mt-1 list-inside list-disc">
              {reikiAddOnRecords.map((addOn) => (
                <li key={addOn.slug}>
                  <strong className="text-[var(--foreground)]">{addOn.label}</strong>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {classOffering ? (
          <dl className="mt-4 space-y-1 text-sm text-muted">
            <div>
              <dt className="sr-only">Schedule</dt>
              <dd>{classOffering.schedule}</dd>
            </div>
            <div>
              <dt className="sr-only">Format</dt>
              <dd>
                {classOffering.format} · {classOffering.location}
              </dd>
            </div>
          </dl>
        ) : null}
      </section>

      {showCeremonyPicker ? (
        <CeremonyMedicinePicker value={ceremonyMedicine} onChange={setCeremonyMedicine} />
      ) : null}

      {showReikiAddOnPicker ? (
        <ReikiAddOnPicker value={reikiAddOns} onChange={setReikiAddOns} />
      ) : null}

      {showFitnessTrainerPicker ? (
        <FitnessTrainerPicker value={practitioner} onChange={setPractitioner} />
      ) : null}

      {showPractitionerPicker ? (
        <PractitionerPicker
          value={practitioner}
          onChange={setPractitioner}
          basePriceCents={slidingScale ? undefined : priceCents}
        />
      ) : null}

      {slidingScale ? (
        <SlidingScalePicker
          scale={slidingScale}
          valueCents={slidingAmountCents}
          onChange={setSlidingAmountCents}
          label="Your contribution"
          id={isFitnessBooking ? "fitness-training-amount" : "card-reading-amount"}
        />
      ) : null}

      <section className="border-t border-subtle pt-10">
        <p className="text-sm text-[var(--foreground)]">
          Paying as <strong>{registration.fullName}</strong> · {registration.email}
        </p>
        {!paymentsReady ? (
          <p className="mt-4 text-sm text-muted">
            Card payments are not configured yet. Add <code className="text-xs">STRIPE_SECRET_KEY</code> to your
            environment.
          </p>
        ) : (
          <>
            <PaymentPlanPicker value={paymentPlan} onChange={setPaymentPlan} />
            <StripePayButton
              apiPath="/api/checkout/service"
              body={{
                serviceSlug,
                ...(slidingScale ? { amountCents: slidingAmountCents } : {}),
                ...(showPractitionerPicker || showFitnessTrainerPicker ? { practitionerSlug: practitioner } : {}),
                ceremonyMedicineSlug: showCeremonyPicker ? ceremonyMedicine : undefined,
                reikiAddOnSlugs: showReikiAddOnPicker && reikiAddOns.length > 0 ? reikiAddOns : undefined,
              }}
              registerNext="book"
              registerOptions={{
                serviceSlug,
                ...(showPractitionerPicker || showFitnessTrainerPicker ? { practitionerSlug: practitioner } : {}),
                ceremonyMedicineSlug: showCeremonyPicker ? ceremonyMedicine : undefined,
                reikiAddOnSlugs: showReikiAddOnPicker && reikiAddOns.length > 0 ? reikiAddOns : undefined,
              }}
              paymentPlan={paymentPlan}
              disabled={
                ((showPractitionerPicker || showFitnessTrainerPicker) && !practitioner) ||
                (showCeremonyPicker && !ceremonyMedicine)
              }
              label={`Pay ${formatUsd(checkoutPriceCents)}`}
            />
          </>
        )}
      </section>

      <p className="text-sm">
        <Link
          href={
            isClass
              ? "/healing-services/classes"
              : isFitnessBooking
                ? "/fitness-training"
                : "/healing-services"
          }
          className="link-accent font-medium hover:underline"
        >
          {isClass ? "← Back to classes" : isFitnessBooking ? "← Back to Fitness Training" : "← Back to Healing Services & Classes"}
        </Link>
      </p>
    </div>
  );
}
