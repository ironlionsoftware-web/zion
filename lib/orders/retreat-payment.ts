import type Stripe from "stripe";
import { markCheckoutNotified } from "@/lib/db/checkout-notifications";
import { retreatPaymentCustomerEmail } from "@/lib/notifications/customer-emails";
import { notifyAdmin, sendCustomerEmail } from "@/lib/notifications/email";
import { claimRetreatParticipantPayment } from "@/lib/db/retreat-bookings";
import { retreatTypeLabelForBooking } from "@/lib/retreat/booking";
import { retreatPricingForBooking } from "@/lib/retreat/pricing";
import type { RetreatBooking } from "@/lib/retreat/types";
import type { RetreatPaymentType } from "@/lib/retreat/types";

function meta(session: Stripe.Checkout.Session, key: string): string {
  return session.metadata?.[key]?.trim() ?? "";
}

export async function confirmRetreatPayment(
  session: Stripe.Checkout.Session,
): Promise<{ booking: RetreatBooking; paymentType: RetreatPaymentType } | null> {
  if (session.payment_status !== "paid") return null;

  const checkoutType = meta(session, "checkout_type");
  if (checkoutType !== "retreat_deposit" && checkoutType !== "retreat_balance") return null;

  const bookingId = meta(session, "booking_id");
  const participantIndex = Number(meta(session, "participant_index"));
  const paymentType = meta(session, "payment_type") as RetreatPaymentType;

  if (!bookingId || !Number.isInteger(participantIndex) || (paymentType !== "deposit" && paymentType !== "balance")) {
    return null;
  }

  const paidAt = new Date().toISOString();
  const update =
    paymentType === "deposit"
      ? { depositPaidAt: paidAt }
      : {
          balancePaidAt: paidAt,
          balancePaymentPlan:
            meta(session, "payment_plan") === "installments" ? ("installments" as const) : ("full" as const),
        };

  // Check-and-set in one locked transaction. The Stripe webhook and the browser's
  // `/api/retreat/confirm-payment` fallback both fire for the same payment; only the caller that
  // actually recorded it gets `claimed`, so the notifications below are sent exactly once.
  const claim = await claimRetreatParticipantPayment(bookingId, participantIndex, update);
  if (!claim) return null;

  const { booking, claimed } = claim;

  if (claimed) {
    const updatedParticipant = booking.participants[participantIndex];
    const retreatLabel = meta(session, "retreat_type_label") || retreatTypeLabelForBooking(booking);
    const amountCents = session.amount_total ?? 0;
    const paymentLabel = paymentType === "deposit" ? "Retreat deposit" : "Retreat balance";

    void notifyAdmin({
      subject: `${paymentLabel} paid: ${updatedParticipant.fullName}`,
      text: [
        `Customer: ${updatedParticipant.fullName} (${updatedParticipant.email})`,
        `Phone: ${updatedParticipant.phone}`,
        `Retreat: ${retreatLabel}`,
        `Payment: ${paymentLabel}`,
        `Amount: $${(amountCents / 100).toFixed(2)}`,
        `Booking ID: ${bookingId}`,
        `Participant #${participantIndex + 1} of ${booking.participants.length}`,
        paymentType === "balance" ? `Payment plan: ${update.balancePaymentPlan ?? "full"}` : null,
      ]
        .filter(Boolean)
        .join("\n"),
    });

    // Guarded by `alreadyRecorded`, so a retried webhook cannot send a duplicate confirmation.
    const confirmation = retreatPaymentCustomerEmail({
      participant: updatedParticipant,
      retreatLabel,
      paymentType,
      amountCents,
      balanceCents: retreatPricingForBooking(booking).balanceCents,
      bookingId,
    });
    void sendCustomerEmail({
      to: updatedParticipant.email,
      subject: confirmation.subject,
      text: confirmation.text,
    });
  }

  return { booking, paymentType };
}

export function notifyDonationPayment(session: Stripe.Checkout.Session): void {
  if (session.payment_status !== "paid" || meta(session, "checkout_type") !== "donation" || !session.id) return;

  void (async () => {
    const firstTime = await markCheckoutNotified(session.id!, "donation");
    if (!firstTime) return;

    const fullName = meta(session, "full_name");
    const email = (session.customer_email ?? meta(session, "email")).trim().toLowerCase();
    const phone = meta(session, "phone");
    const amountCents = session.amount_total ?? 0;
    const paymentPlan = meta(session, "payment_plan") || "full";

    void notifyAdmin({
      subject: `Donation received: ${fullName || email}`,
      text: [
        fullName ? `Donor: ${fullName}` : null,
        `Email: ${email}`,
        phone ? `Phone: ${phone}` : null,
        `Amount: $${(amountCents / 100).toFixed(2)}`,
        `Payment plan: ${paymentPlan}`,
      ]
        .filter(Boolean)
        .join("\n"),
    });
  })();
}
