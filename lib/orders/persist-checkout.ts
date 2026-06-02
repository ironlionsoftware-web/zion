import type Stripe from "stripe";
import { resolveCartLines } from "@/lib/cart/products";
import type { CartLine } from "@/lib/cart/types";
import { insertServiceBooking } from "@/lib/db/service-bookings";
import { insertShopOrder } from "@/lib/db/shop-orders";
import { notifyAdmin } from "@/lib/notifications/email";
import { confirmRetreatPayment, notifyDonationPayment } from "@/lib/orders/retreat-payment";

function meta(session: Stripe.Checkout.Session, key: string): string {
  return session.metadata?.[key]?.trim() ?? "";
}

export async function persistCheckoutSession(session: Stripe.Checkout.Session): Promise<void> {
  if (session.payment_status !== "paid" || !session.id) return;

  const checkoutType = meta(session, "checkout_type");

  if (checkoutType === "donation") {
    notifyDonationPayment(session);
    return;
  }

  if (checkoutType === "retreat_deposit" || checkoutType === "retreat_balance") {
    await confirmRetreatPayment(session);
    return;
  }

  const fullName = meta(session, "full_name");
  const email = (session.customer_email ?? meta(session, "email")).trim().toLowerCase();
  const phone = meta(session, "phone");
  const paymentPlan = meta(session, "payment_plan") || "full";
  const paidAt = new Date().toISOString();

  if (checkoutType === "service") {
    const amountCents = session.amount_total ?? 0;
    const booking = await insertServiceBooking({
      stripeSessionId: session.id,
      fullName,
      email,
      phone,
      serviceSlug: meta(session, "service_slug"),
      serviceLabel: meta(session, "service_label"),
      practitionerSlug: meta(session, "practitioner_slug"),
      practitionerName: meta(session, "practitioner_name"),
      ceremonyMedicineSlug: meta(session, "ceremony_medicine_slug") || undefined,
      ceremonyMedicineLabel: meta(session, "ceremony_medicine_label") || undefined,
      amountCents,
      paymentPlan,
      paidAt,
    });

    if (booking) {
      void notifyAdmin({
        subject: `Service booking paid: ${booking.serviceLabel}`,
        text: [
          `Customer: ${booking.fullName} (${booking.email})`,
          `Service: ${booking.serviceLabel}`,
          booking.ceremonyMedicineLabel ? `Ceremony: ${booking.ceremonyMedicineLabel}` : null,
          `Practitioner: ${booking.practitionerName}`,
          `Amount: $${(booking.amountCents / 100).toFixed(2)}`,
          `Payment plan: ${booking.paymentPlan}`,
        ]
          .filter(Boolean)
          .join("\n"),
      });
    }
    return;
  }

  if (checkoutType === "shop") {
    const cartMeta = meta(session, "cart");
    const items: CartLine[] = cartMeta
      .split(",")
      .map((part) => {
        const match = part.match(/^(.+)x(\d+)$/);
        if (!match) return null;
        return { slug: match[1], quantity: Number(match[2]) };
      })
      .filter((row): row is CartLine => row !== null && row.quantity > 0);

    const lines = resolveCartLines(items);
    const fulfillmentNote = meta(session, "fulfillment_note");
    const note = fulfillmentNote === "none" ? null : fulfillmentNote || null;

    const order = await insertShopOrder({
      stripeSessionId: session.id,
      fullName,
      email,
      phone,
      lineItems: lines.map((line) => ({
        slug: line.slug,
        name: line.name,
        quantity: line.quantity,
        priceCents: line.priceCents,
      })),
      fulfillmentNote: note,
      subtotalCents: session.amount_total ?? 0,
      paymentPlan,
      paidAt,
    });

    if (order) {
      const itemsText = order.lineItems.map((l) => `${l.name} x${l.quantity}`).join(", ");
      void notifyAdmin({
        subject: `New shop order: ${order.fullName}`,
        text: [
          `Customer: ${order.fullName} (${order.email})`,
          `Items: ${itemsText}`,
          `Total: $${(order.subtotalCents / 100).toFixed(2)}`,
          order.fulfillmentNote ? `Fulfillment: ${order.fulfillmentNote}` : null,
        ]
          .filter(Boolean)
          .join("\n"),
      });
    }
  }
}
