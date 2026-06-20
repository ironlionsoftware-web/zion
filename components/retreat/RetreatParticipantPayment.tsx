"use client";

import Link from "next/link";
import { useState } from "react";
import { PaymentPlanPicker } from "@/components/payments/PaymentPlanPicker";
import { StripePayButton } from "@/components/payments/StripePayButton";
import {
  balanceDueWindow,
  formatRetreatUsd,
  mobilityLevelLabel,
  participantMatchesRegistration,
  retreatPricing,
} from "@/lib/retreat/booking";
import { retreatPricingForBooking } from "@/lib/retreat/pricing";
import { registerHref } from "@/lib/registration/redirect";
import type { PaymentPlan } from "@/lib/payments/types";
import type { ClientRegistration } from "@/lib/registration/types";
import type { RetreatBooking, RetreatParticipant } from "@/lib/retreat/types";

type RetreatParticipantPaymentProps = {
  bookingId: string;
  booking: RetreatBooking;
  participantIndex: number;
  participant: RetreatParticipant;
  registration: ClientRegistration;
  paymentsReady: boolean;
};

export function RetreatParticipantPayment({
  bookingId,
  booking,
  participantIndex,
  participant,
  registration,
  paymentsReady,
}: RetreatParticipantPaymentProps) {
  const cfg = retreatPricing();
  const quote = retreatPricingForBooking(booking);
  const [depositPlan, setDepositPlan] = useState<PaymentPlan>("full");
  const [balancePlan, setBalancePlan] = useState<PaymentPlan>("installments");

  const emailMatches = participantMatchesRegistration(participant, registration);
  const balanceWindow = participant.depositPaidAt ? balanceDueWindow(participant.depositPaidAt) : null;

  return (
    <article className="card p-5">
      <h3 className="font-medium text-[var(--foreground)]">{participant.fullName}</h3>
      <p className="mt-1 text-sm text-muted">{participant.email}</p>
      {"age" in participant && participant.age != null ? (
        <dl className="mt-3 space-y-1 text-sm text-muted">
          <div>
            <dt className="inline font-medium text-[var(--foreground)]">Age: </dt>
            <dd className="inline">{participant.age}</dd>
          </div>
          {"fitnessMobilityLevel" in participant && participant.fitnessMobilityLevel ? (
            <div>
              <dt className="inline font-medium text-[var(--foreground)]">Mobility: </dt>
              <dd className="inline">{mobilityLevelLabel(participant.fitnessMobilityLevel)}</dd>
            </div>
          ) : null}
          {"dietaryRestrictionsAndAllergies" in participant &&
          participant.dietaryRestrictionsAndAllergies ? (
            <div>
              <dt className="font-medium text-[var(--foreground)]">Dietary / allergies</dt>
              <dd className="mt-0.5 whitespace-pre-wrap">{participant.dietaryRestrictionsAndAllergies}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      <ul className="mt-4 space-y-2 text-sm">
        <li>
          <span className="font-medium">Deposit ({formatRetreatUsd(quote.depositCents)}):</span>{" "}
          {participant.depositPaidAt ? (
            <span className="text-[var(--rasta-green)]">Paid {new Date(participant.depositPaidAt).toLocaleDateString()}</span>
          ) : (
            <span className="text-muted">Due now</span>
          )}
        </li>
        <li>
          <span className="font-medium">Balance ({formatRetreatUsd(quote.balanceCents)}):</span>{" "}
          {participant.balancePaidAt ? (
            <span className="text-[var(--rasta-green)]">
              Paid {new Date(participant.balancePaidAt).toLocaleDateString()}
              {participant.balancePaymentPlan === "installments" ? " (installments)" : ""}
            </span>
          ) : participant.depositPaidAt && balanceWindow ? (
            <span className="text-muted">
              {balanceWindow.isOpen
                ? `Due by ${balanceWindow.dueBy.toLocaleDateString()}`
                : balanceWindow.isOverdue
                  ? "Overdue. Contact us"
                  : `Opens ${balanceWindow.opensAt.toLocaleDateString()}`}
            </span>
          ) : (
            <span className="text-muted">After deposit (weeks {cfg.balanceDueMinWeeks} to {cfg.balanceDueMaxWeeks})</span>
          )}
        </li>
      </ul>

      {!emailMatches ? (
        <div className="mt-5 border-t border-subtle pt-5">
          <p className="text-sm text-muted">
            You are signed in as <strong>{registration.email}</strong>, but this payment is for{" "}
            <strong>{participant.email}</strong>. Register with that email to pay for {participant.fullName}.
          </p>
          <Link
            href={registerHref("retreat", { bookingId, participantIndex })}
            className="btn btn-primary mt-4 inline-flex text-sm"
          >
            Register to pay
          </Link>
        </div>
      ) : !participant.depositPaidAt ? (
        <div className="mt-5 border-t border-subtle pt-5">
          <p className="text-sm text-[var(--foreground)]">
            Paying as <strong>{registration.fullName}</strong>
          </p>
          {paymentsReady ? (
            <>
              <PaymentPlanPicker value={depositPlan} onChange={setDepositPlan} />
              <StripePayButton
                apiPath="/api/checkout/retreat-deposit"
                body={{ bookingId, participantIndex }}
                registerNext="retreat"
                registerOptions={{ bookingId, participantIndex }}
                paymentPlan={depositPlan}
                label={`Pay ${formatRetreatUsd(quote.depositCents)} deposit`}
              />
            </>
          ) : (
            <p className="mt-3 text-sm text-muted">Add STRIPE_SECRET_KEY to enable payments.</p>
          )}
        </div>
      ) : !participant.balancePaidAt && balanceWindow?.isOpen ? (
        <div className="mt-5 border-t border-subtle pt-5">
          <PaymentPlanPicker value={balancePlan} onChange={setBalancePlan} />
          {paymentsReady ? (
            <StripePayButton
              apiPath="/api/checkout/retreat-balance"
              body={{ bookingId, participantIndex }}
              registerNext="retreat"
              registerOptions={{ bookingId, participantIndex }}
              paymentPlan={balancePlan}
              label={`Pay ${formatRetreatUsd(quote.balanceCents)} balance`}
            />
          ) : null}
        </div>
      ) : participant.depositPaidAt && participant.balancePaidAt ? (
        <p className="mt-5 text-sm font-medium text-[var(--rasta-green)]">Fully paid. Thank you!</p>
      ) : null}
    </article>
  );
}
