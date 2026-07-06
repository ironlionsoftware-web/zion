import type Stripe from "stripe";
import { formatUsd } from "@/lib/cart/products";
import type { DbShopOrder } from "@/lib/db/types";

function meta(session: Stripe.Checkout.Session, key: string): string {
  return session.metadata?.[key]?.trim() ?? "";
}

function line(label: string, value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return `${label}: ${trimmed}`;
}

function section(title: string, lines: Array<string | null | undefined>): string {
  const body = lines.filter(Boolean).join("\n");
  return body ? `${title}\n${body}` : "";
}

export function formatShopOrderAdminEmail(
  session: Stripe.Checkout.Session,
  order: DbShopOrder,
): { subject: string; text: string } {
  const deliveryFeeCents = Number(meta(session, "delivery_fee_cents") || "0");
  const freeDelivery = meta(session, "free_delivery") === "true";
  const itemsSubtotalCents = order.lineItems
    .filter((item) => item.slug !== "delivery")
    .reduce((sum, item) => sum + item.priceCents * item.quantity, 0);

  const itemLines = order.lineItems
    .filter((item) => item.slug !== "delivery")
    .map((item) => `- ${item.name} × ${item.quantity} — ${formatUsd(item.priceCents)} each`);

  const text = [
    `A customer placed a shop order on Iron Lion.`,
    "",
    section("CUSTOMER", [
      line("Name", order.fullName),
      line("Email", order.email),
      line("Phone", order.phone),
    ]),
    "",
    section("DELIVERY ADDRESS", [
      order.fulfillmentNote ? order.fulfillmentNote : "Not provided",
      meta(session, "delivery_city") || meta(session, "delivery_state") || meta(session, "delivery_postal")
        ? [
            meta(session, "delivery_city") && meta(session, "delivery_state") && meta(session, "delivery_postal")
              ? `${meta(session, "delivery_city")}, ${meta(session, "delivery_state")} ${meta(session, "delivery_postal")}`
              : null,
          ]
            .filter(Boolean)
            .join("\n") || null
        : null,
    ]),
    "",
    section("ITEMS", itemLines),
    "",
    section("DELIVERY & PAYMENT", [
      line("Items subtotal", formatUsd(itemsSubtotalCents)),
      freeDelivery
        ? "Delivery: Free (Greater Austin area)"
        : line("Delivery fee", formatUsd(deliveryFeeCents)),
      line("Order total", formatUsd(order.subtotalCents)),
      line("Payment plan", order.paymentPlan),
      line("Paid at", order.paidAt),
      line("Stripe session", session.id),
    ]),
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject: `Shop order: ${order.fullName}`,
    text,
  };
}
