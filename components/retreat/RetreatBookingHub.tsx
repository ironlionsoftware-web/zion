"use client";

import { useCallback, useEffect, useState } from "react";
import { RetreatParticipantPayment } from "./RetreatParticipantPayment";
import type { ClientRegistration } from "@/lib/registration/types";
import { formatRetreatUsd, retreatTypeLabelForBooking } from "@/lib/retreat/booking";
import { retreatPricingForBooking } from "@/lib/retreat/pricing";
import type { RetreatBooking } from "@/lib/retreat/types";

type RetreatBookingHubProps = {
  bookingId: string;
  initialBooking: RetreatBooking;
  registration: ClientRegistration | null;
  paymentsReady: boolean;
  highlightParticipant?: number;
};

export function RetreatBookingHub({
  bookingId,
  initialBooking,
  registration,
  paymentsReady,
  highlightParticipant,
}: RetreatBookingHubProps) {
  const [booking, setBooking] = useState(initialBooking);
  const [confirming, setConfirming] = useState(false);

  const refreshBooking = useCallback(async () => {
    const res = await fetch(`/api/retreat/booking/${bookingId}`);
    if (!res.ok) return;
    const data = (await res.json()) as { booking: RetreatBooking };
    setBooking(data.booking);
  }, [bookingId]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    const payment = params.get("payment");

    if (!sessionId || (payment !== "deposit" && payment !== "balance")) return;

    setConfirming(true);
    fetch("/api/retreat/confirm-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then(() => refreshBooking())
      .finally(() => {
        setConfirming(false);
        const url = new URL(window.location.href);
        url.searchParams.delete("session_id");
        url.searchParams.delete("payment");
        url.searchParams.delete("canceled");
        window.history.replaceState({}, "", url.toString());
      });
  }, [refreshBooking]);

  return (
    <div className="space-y-6">
      {confirming ? (
        <p className="card p-4 text-sm text-muted" role="status">
          Confirming your payment…
        </p>
      ) : null}

      <div className="card p-5 text-sm">
        <p className="font-medium text-[var(--foreground)]">{retreatTypeLabelForBooking(booking)}</p>
        <p className="mt-2 text-muted">
          {formatRetreatUsd(retreatPricingForBooking(booking).totalCents)} per person ·{" "}
          {formatRetreatUsd(retreatPricingForBooking(booking).depositCents)} deposit ·{" "}
          {formatRetreatUsd(retreatPricingForBooking(booking).balanceCents)} balance
        </p>
        <p className="mt-2 text-muted">
          Booking reference: <code className="text-xs">{bookingId}</code> · {booking.participants.length}{" "}
          participants
        </p>
      </div>

      <ul className="grid gap-6">
        {booking.participants.map((participant, index) => (
          <li
            key={`${participant.email}-${index}`}
            className={
              highlightParticipant === index ? "ring-2 ring-[var(--rasta-green)] ring-offset-2 rounded-xl" : undefined
            }
          >
            <RetreatParticipantPayment
              bookingId={bookingId}
              booking={booking}
              participantIndex={index}
              participant={participant}
              registration={registration}
              paymentsReady={paymentsReady}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
