import type Stripe from "stripe";
import { markCheckoutNotified } from "@/lib/db/checkout-notifications";
import { notifyAdmin } from "@/lib/notifications/email";
import { retreatTypeLabelForBooking } from "@/lib/retreat/booking";
import { getRetreatBooking, updateRetreatParticipant } from "@/lib/retreat/storage";
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

  const existing = await getRetreatBooking(bookingId);
  const participant = existing?.participants[participantIndex];
  if (!existing || !participant) return null;

  const alreadyRecorded =
    paymentType === "deposit" ? Boolean(participant.depositPaidAt) : Boolean(participant.balancePaidAt);

  const update =
    paymentType === "deposit"
      ? { depositPaidAt: participant.depositPaidAt ?? new Date().toISOString() }
      : {
          balancePaidAt: participant.balancePaidAt ?? new Date().toISOString(),
          balancePaymentPlan:
            meta(session, "payment_plan") === "installments" ? ("installments" as const) : ("full" as const),
        };

  const booking = alreadyRecorded ? existing : await updateRetreatParticipant(bookingId, participantIndex, update);
  if (!booking) return null;

  if (!alreadyRecorded) {
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
