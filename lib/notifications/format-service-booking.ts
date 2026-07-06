import type Stripe from "stripe";
import { formatScheduledSlot } from "@/lib/booking/calendly-schedule";
import { formatUsd } from "@/lib/cart/products";
import type { DbServiceBooking } from "@/lib/db/types";

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

function formatScheduledTime(session: Stripe.Checkout.Session): string {
  const label = meta(session, "scheduled_label");
  if (label) return label;

  const start = meta(session, "scheduled_start");
  const end = meta(session, "scheduled_end");
  if (start && end) {
    try {
      return formatScheduledSlot({ startTime: start, endTime: end, eventUri: meta(session, "calendly_event_uri") || "https://calendly.com/" });
    } catch {
      return `${start} – ${end}`;
    }
  }

  return "Not provided";
}

function fitnessDetails(session: Stripe.Checkout.Session): string[] {
  if (meta(session, "service_slug") !== "fitness-training") return [];

  const lines = [
    line("Training plan", meta(session, "ceremony_medicine_label")),
    line("Session type", meta(session, "fitness_session_type")),
    line("Format", meta(session, "fitness_training_format")),
    meta(session, "fitness_training_format") === "group"
      ? line("Group size", meta(session, "fitness_group_size"))
      : null,
    line("Age group", meta(session, "fitness_audience")),
    line("Sessions per week", meta(session, "fitness_sessions_per_week")),
    line("Billing", meta(session, "fitness_billing_mode")),
    meta(session, "fitness_per_session_cents")
      ? line("Per-session rate", formatUsd(Number(meta(session, "fitness_per_session_cents"))))
      : null,
  ].filter((value): value is string => Boolean(value));

  return lines;
}

function serviceDetails(session: Stripe.Checkout.Session): string[] {
  const slug = meta(session, "service_slug");

  if (slug === "fitness-training") {
    return fitnessDetails(session);
  }

  if (slug === "reiki") {
    const addOns = meta(session, "reiki_add_on_labels") || meta(session, "ceremony_medicine_label");
    return addOns ? [`Add-ons: ${addOns}`] : [];
  }

  if (slug === "plant-medicine-ceremonies") {
    const ceremony = meta(session, "ceremony_medicine_label");
    return ceremony ? [`Ceremony: ${ceremony}`] : [];
  }

  if (meta(session, "class_slug")) {
    return [
      line("Class", meta(session, "class_slug")),
      line("Schedule", meta(session, "class_schedule")),
    ].filter((value): value is string => Boolean(value));
  }

  const ceremony = meta(session, "ceremony_medicine_label");
  return ceremony ? [`Notes: ${ceremony}`] : [];
}

export function formatServiceBookingAdminEmail(
  session: Stripe.Checkout.Session,
  booking: DbServiceBooking,
): { subject: string; text: string } {
  const amountCents = booking.amountCents;
  const recurring = booking.paymentPlan === "recurring";

  const text = [
    `A customer completed a service booking on Iron Lion.`,
    "",
    section("CUSTOMER", [
      line("Name", booking.fullName),
      line("Email", booking.email),
      line("Phone", booking.phone),
    ]),
    "",
    section("REQUESTED DATE & TIME", [
      line("Appointment", formatScheduledTime(session)),
      line("Calendly event", meta(session, "calendly_event_uri")),
    ]),
    "",
    section("SERVICE", [
      line("Service", booking.serviceLabel),
      line("Service ID", booking.serviceSlug),
      meta(session, "session_format") === "dual" ? "Session format: Dual session (both practitioners)" : null,
      line("Practitioner", booking.practitionerName),
      ...serviceDetails(session),
    ]),
    "",
    section("PAYMENT", [
      line("Amount", `${formatUsd(amountCents)}${recurring ? " (weekly subscription)" : ""}`),
      line("Payment plan", booking.paymentPlan),
      line("Paid at", booking.paidAt),
      line("Stripe session", session.id),
      session.subscription ? line("Stripe subscription", String(session.subscription)) : null,
    ]),
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject: `Service booking: ${booking.serviceLabel} — ${booking.fullName}`,
    text,
  };
}
