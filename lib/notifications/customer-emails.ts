import { site } from "@/content/site";
import type { DbServiceBooking, DbShopOrder } from "@/lib/db/types";
import type { RetreatParticipant, RetreatPaymentType } from "@/lib/retreat/types";

/**
 * Customer-facing transactional email copy.
 *
 * Plain text on purpose: it renders everywhere, never lands in a promotions tab for looking like
 * a newsletter, and matches the unhurried tone of the brand. Voice follows the site — warm,
 * consent-led, no hype, no pressure.
 */

function usd(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

function signOff(): string[] {
  return [
    "",
    "With care,",
    site.shortName,
    "",
    `${site.contact.email} · ${site.contact.phoneDisplay} (${site.contact.phoneNote.toLowerCase()})`,
    site.url,
  ];
}

function body(lines: (string | null | false)[]): string {
  return [...lines, ...signOff()].filter((line): line is string => typeof line === "string").join("\n");
}

export function serviceBookingCustomerEmail(booking: DbServiceBooking): {
  subject: string;
  text: string;
} {
  const firstName = booking.fullName.trim().split(/\s+/)[0] || "there";
  const recurring = booking.paymentPlan === "recurring";

  return {
    subject: `Your ${booking.serviceLabel} is confirmed`,
    text: body([
      `Hi ${firstName},`,
      "",
      "Thank you — your payment came through and your session is confirmed.",
      "",
      "WHAT YOU BOOKED",
      `Service: ${booking.serviceLabel}`,
      booking.ceremonyMedicineLabel ? `Includes: ${booking.ceremonyMedicineLabel}` : null,
      `Practitioner: ${booking.practitionerName}`,
      `Amount: ${usd(booking.amountCents)}${recurring ? " per week (recurring)" : ""}`,
      "",
      "WHAT HAPPENS NEXT",
      "You'll receive a separate confirmation from Calendly with your date, time, and a link to",
      "reschedule if you need to. If you booked a time already, that's your appointment.",
      "",
      "Come as you are. Wear something you can move in, and bring water. If anything is going on",
      "with your body, your energy, or your schedule, tell us — we'll adjust. Nothing about your",
      "session is fixed, and you can change your mind about any part of it at any time.",
      "",
      recurring
        ? "This is a recurring weekly booking. You can cancel anytime from the link in your Stripe receipt."
        : null,
      recurring ? "" : null,
      "If you need to reach us before then, just reply to this email.",
    ]),
  };
}

export function shopOrderCustomerEmail(order: DbShopOrder): { subject: string; text: string } {
  const firstName = order.fullName.trim().split(/\s+/)[0] || "there";
  const items = order.lineItems.map(
    (line) => `  ${line.quantity} × ${line.name} — ${usd(line.priceCents * line.quantity)}`,
  );

  return {
    subject: `We got your order — ${site.shortName}`,
    text: body([
      `Hi ${firstName},`,
      "",
      "Thank you for your order. Here's what we're preparing for you:",
      "",
      ...items,
      "",
      `Total: ${usd(order.subtotalCents)}`,
      order.fulfillmentNote ? `Delivery notes: ${order.fulfillmentNote}` : null,
      "",
      "WHAT HAPPENS NEXT",
      "We'll be in touch by email or text to arrange delivery or pickup. If you're in the",
      // serviceArea reads "Greater Austin area. Nationwide by arrangement." — only the first
      // sentence belongs mid-sentence here.
      `${site.contact.serviceArea.split(".")[0].trim()}, that's usually quick.`,
      "",
      "Questions about how to use anything you ordered? Just reply — we're happy to walk you",
      "through it.",
    ]),
  };
}

export function retreatPaymentCustomerEmail(params: {
  participant: RetreatParticipant;
  retreatLabel: string;
  paymentType: RetreatPaymentType;
  amountCents: number;
  balanceCents?: number;
  bookingId: string;
}): { subject: string; text: string } {
  const { participant, retreatLabel, paymentType, amountCents, balanceCents, bookingId } = params;
  const firstName = participant.fullName.trim().split(/\s+/)[0] || "there";
  const isDeposit = paymentType === "deposit";
  const balanceDue = isDeposit && typeof balanceCents === "number" && balanceCents > 0;

  return {
    subject: isDeposit
      ? `Your place is held — ${retreatLabel}`
      : `You're all set for ${retreatLabel}`,
    text: body([
      `Hi ${firstName},`,
      "",
      isDeposit
        ? "Your deposit came through and your place on the retreat is held."
        : "Your balance is paid in full. Everything is settled for your retreat.",
      "",
      "YOUR RETREAT",
      `Retreat: ${retreatLabel}`,
      `${isDeposit ? "Deposit" : "Balance"} paid: ${usd(amountCents)}`,
      balanceDue ? `Balance remaining: ${usd(balanceCents)}` : null,
      `Reference: ${bookingId}`,
      "",
      "WHAT HAPPENS NEXT",
      balanceDue
        ? "We'll follow up with your balance due date and everything you need to prepare — travel,"
        : "We'll follow up with everything you need to prepare — travel,",
      "what to pack, what the days look like, and how to get ready in body and mind.",
      "",
      "You told us about your dietary needs and mobility level when you registered, and we've got",
      "those on file. If anything changes between now and then — health, travel, or anything at",
      "all — tell us early and we'll work with it.",
      "",
      "This is a real journey and we're glad you're coming.",
    ]),
  };
}
