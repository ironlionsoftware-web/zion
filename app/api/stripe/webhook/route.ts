import { NextResponse } from "next/server";
import type Stripe from "stripe";
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

    void notifyAdmin({
      subject: `Fitness subscription renewed: ${meta(subscription, "service_label") || "Fitness training"}`,
      text: [
        `Customer email: ${invoice.customer_email ?? "unknown"}`,
        `Training plan: ${meta(subscription, "ceremony_medicine_label") || "—"}`,
        `Trainer: ${meta(subscription, "practitioner_name") || "—"}`,
        `Amount: $${((invoice.amount_paid ?? 0) / 100).toFixed(2)}`,
        `Stripe subscription: ${subscriptionId}`,
      ].join("\n"),
    });
  }

  return NextResponse.json({ received: true });
}
