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
  getReikiAddOnOption,
  getReikiAddOnPriceCents,
  isReikiService,
} from "@/lib/booking/reiki-addon";
import { RegisterForm } from "@/components/registration/RegisterForm";
import { PaymentPlanPicker } from "@/components/payments/PaymentPlanPicker";
import { StripePayButton } from "@/components/payments/StripePayButton";
import {
  computeServiceCheckoutCents,
  getPractitioner,
  getPractitioners,
  isDualPractitionerSlug,
} from "@/lib/booking/practitioners";
import { calendlyUrlWithPrefill } from "@/lib/registration/redirect";
import { formatUsd } from "@/lib/cart/products";
import type { PaymentPlan } from "@/lib/payments/types";
import type { ClientRegistration } from "@/lib/registration/types";
import { site } from "@/content/site";

type ServiceCheckoutProps = {
  serviceSlug: string;
  serviceLabel: string;
  priceCents: number;
  registration: ClientRegistration | null;
  paymentsReady: boolean;
  success: boolean;
  canceled: boolean;
  initialPractitioner?: string;
  initialCeremonyMedicine?: string;
  initialReikiAddOn?: string;
};

export function ServiceCheckout({
  serviceSlug,
  serviceLabel,
  priceCents,
  registration,
  paymentsReady,
  success: successProp,
  canceled,
  initialPractitioner,
  initialCeremonyMedicine,
  initialReikiAddOn,
}: ServiceCheckoutProps) {
  const isClass = isClassService(serviceSlug);
  const classOffering = getClassOfferingFromServiceSlug(serviceSlug);
  const showCeremonyPicker = isPlantMedicineCeremonyService(serviceSlug);
  const showReikiAddOnPicker = isReikiService(serviceSlug);
  const showPractitionerPicker = !isClass;
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
  const [practitioner, setPractitioner] = useState<string>(
    initialPractitioner ?? getPractitioners()[0]?.slug ?? "",
  );
  const [ceremonyMedicine, setCeremonyMedicine] = useState<string>(
    showCeremonyPicker ? (initialCeremonyMedicine ?? ceremonyOptions[0]?.slug ?? "") : "",
  );
  const [reikiAddOn, setReikiAddOn] = useState<string>(initialReikiAddOn ?? "");
  const practitionerRecord = getPractitioner(practitioner);
  const ceremonyMedicineRecord = showCeremonyPicker ? getCeremonyMedicine(ceremonyMedicine) : undefined;
  const reikiAddOnRecord = getReikiAddOnOption(reikiAddOn);
  const baseCheckoutCents = showPractitionerPicker
    ? computeServiceCheckoutCents(priceCents, practitioner)
    : priceCents;
  const checkoutPriceCents =
    baseCheckoutCents + (reikiAddOnRecord ? getReikiAddOnPriceCents() : 0);
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
        <p className="mt-2 text-2xl font-medium text-[var(--rasta-green)]">{formatUsd(checkoutPriceCents)}</p>
        {isDual && baseCheckoutCents !== priceCents ? (
          <p className="mt-1 text-xs text-muted">
            Dual session ({site.practitioners.dualSession.priceMultiplier}× single practitioner rate)
          </p>
        ) : (
          <p className="mt-1 text-xs text-muted">Excluding sales tax where applicable</p>
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
        {reikiAddOnRecord ? (
          <p className="mt-2 text-sm text-muted">
            Add-on: <strong className="text-[var(--foreground)]">{reikiAddOnRecord.label}</strong> (
            {formatUsd(getReikiAddOnPriceCents())})
          </p>
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
        <ReikiAddOnPicker value={reikiAddOn} onChange={setReikiAddOn} />
      ) : null}

      {showPractitionerPicker ? (
        <PractitionerPicker
          value={practitioner}
          onChange={setPractitioner}
          basePriceCents={priceCents}
        />
      ) : null}

      {!registration ? (
        <section className="border-t border-subtle pt-10">
          <h2 className="font-display text-xl font-medium text-[var(--foreground)]">
            {site.registration.title}
          </h2>
          <p className="prose-content mt-3">{site.registration.intro}</p>
          <RegisterForm
            next="book"
            service={serviceSlug}
            source="service-checkout"
            initialPractitioner={practitioner}
            initialCeremonyMedicine={showCeremonyPicker ? ceremonyMedicine : undefined}
            initialReikiAddOn={showReikiAddOnPicker ? reikiAddOn : undefined}
          />
        </section>
      ) : (
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
                  ...(showPractitionerPicker ? { practitionerSlug: practitioner } : {}),
                  ceremonyMedicineSlug: showCeremonyPicker ? ceremonyMedicine : undefined,
                  reikiAddOnSlug: showReikiAddOnPicker ? reikiAddOn || undefined : undefined,
                }}
                registerNext="book"
                registerOptions={{
                  serviceSlug,
                  ...(showPractitionerPicker ? { practitionerSlug: practitioner } : {}),
                  ceremonyMedicineSlug: showCeremonyPicker ? ceremonyMedicine : undefined,
                  reikiAddOnSlug: showReikiAddOnPicker ? reikiAddOn || undefined : undefined,
                }}
                paymentPlan={paymentPlan}
                disabled={
                  (showPractitionerPicker && !practitioner) || (showCeremonyPicker && !ceremonyMedicine)
                }
                label={`Pay ${formatUsd(checkoutPriceCents)}`}
              />
            </>
          )}
        </section>
      )}

      <p className="text-sm">
        <Link
          href={isClass ? "/healing-services/classes" : "/healing-services"}
          className="link-accent font-medium hover:underline"
        >
          {isClass ? "← Back to classes" : "← Back to Healing Services & Classes"}
        </Link>
      </p>
    </div>
  );
}
