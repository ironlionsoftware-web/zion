import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { insertSubscriptionPayment } from "@/lib/db/subscription-payments";
import { persistCheckoutSession } from "@/lib/orders/persist-checkout";
import { notifyAdmin } from "@/lib/notifications/email";
import { getStripe } from "@/lib/stripe/server";

function meta(object: { metadata?: Stripe.Metadata | null }, key: string): string {
  return object.metadata?.[key]?.trim() ?? "";
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const body = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature failed:", error);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    await persistCheckoutSession(session);
  }

  if (event.type === "invoice.paid") {
    const invoice = event.data.object as Stripe.Invoice;
    if (invoice.billing_reason !== "subscription_cycle") return NextResponse.json({ received: true });
    if (invoice.parent?.type !== "subscription_details") return NextResponse.json({ received: true });

    const subscriptionRef = invoice.parent.subscription_details?.subscription;
    const subscriptionId = typeof subscriptionRef === "string" ? subscriptionRef : subscriptionRef?.id;
    if (!subscriptionId) return NextResponse.json({ received: true });

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    if (meta(subscription, "checkout_type") !== "service" || meta(subscription, "service_slug") !== "fitness-training") {
      return NextResponse.json({ received: true });
    }

    const serviceLabel = meta(subscription, "service_label") || "Fitness training";
    const planSummary = meta(subscription, "ceremony_medicine_label");
    const practitionerName = meta(subscription, "practitioner_name");
    const amountCents = invoice.amount_paid ?? 0;
    const paidAtSeconds = invoice.status_transitions?.paid_at ?? Math.floor(Date.now() / 1000);

    // Record the renewal before notifying. Email used to be the only trace, so a failed send or an
    // unread inbox meant a customer was charged with no record anywhere in this app. The unique
    // constraint on the invoice id also makes Stripe's webhook retries idempotent, so the null
    // return doubles as the guard against duplicate notification emails.
    const recorded = invoice.id
      ? await insertSubscriptionPayment({
          stripeInvoiceId: invoice.id,
          stripeSubscriptionId: subscriptionId,
          email: (invoice.customer_email ?? "").trim().toLowerCase(),
          serviceSlug: meta(subscription, "service_slug") || "fitness-training",
          serviceLabel,
          practitionerSlug: meta(subscription, "practitioner_slug") || undefined,
          practitionerName: practitionerName || undefined,
          planSummary: planSummary || undefined,
          amountCents,
          paidAt: new Date(paidAtSeconds * 1000).toISOString(),
        })
      : null;

    if (recorded) {
      void notifyAdmin({
        subject: `Fitness subscription renewed: ${serviceLabel}`,
        text: [
          `Customer email: ${invoice.customer_email ?? "unknown"}`,
          `Training plan: ${planSummary || "—"}`,
          `Trainer: ${practitionerName || "—"}`,
          `Amount: $${(amountCents / 100).toFixed(2)}`,
          `Stripe subscription: ${subscriptionId}`,
          `Stripe invoice: ${invoice.id}`,
        ].join("\n"),
      });
    }
  }

  return NextResponse.json({ received: true });
}
