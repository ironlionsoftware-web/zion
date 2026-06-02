import type Stripe from "stripe";
import type { ClientRegistration } from "@/lib/registration/types";
import type { PaymentPlan } from "@/lib/payments/types";

export type CheckoutLineItem = {
  name: string;
  description?: string;
  unitAmountCents: number;
  quantity: number;
};

type CreateCheckoutParams = {
  stripe: Stripe;
  registration: ClientRegistration;
  lineItems: CheckoutLineItem[];
  paymentPlan: PaymentPlan;
  successUrl: string;
  cancelUrl: string;
  metadata: Record<string, string>;
};

function paymentMethodTypes(plan: PaymentPlan): ("card" | "klarna" | "affirm")[] {
  if (plan === "installments") {
    return ["card", "klarna", "affirm"];
  }
  return ["card"];
}

export async function createStripeCheckoutSession(params: CreateCheckoutParams): Promise<Stripe.Checkout.Session> {
  const { stripe, registration, lineItems, paymentPlan, successUrl, cancelUrl, metadata } = params;

  return stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: registration.email,
    client_reference_id: registration.email,
    payment_method_types: paymentMethodTypes(paymentPlan),
    line_items: lineItems.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: "usd",
        unit_amount: item.unitAmountCents,
        product_data: {
          name: item.name,
          description: item.description,
        },
      },
    })),
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      payment_plan: paymentPlan,
      full_name: registration.fullName,
      phone: registration.phone,
      registered_at: registration.registeredAt,
      ...metadata,
    },
  });
}
