import type { RegisterNext } from "@/lib/registration/types";

export type DbRegistration = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  registeredAt: string;
  marketingConsent: boolean;
  next: RegisterNext;
  service: string | null;
  practitioner: string | null;
  source: string;
  createdAt: string;
};

export type DbServiceBooking = {
  id: number;
  stripeSessionId: string;
  fullName: string;
  email: string;
  phone: string;
  serviceSlug: string;
  serviceLabel: string;
  practitionerSlug: string;
  practitionerName: string;
  ceremonyMedicineSlug: string | null;
  ceremonyMedicineLabel: string | null;
  amountCents: number;
  paymentPlan: string;
  paidAt: string;
  createdAt: string;
};

export type ShopOrderStatus = "pending" | "fulfilled";

export type ShopOrderLine = {
  slug: string;
  name: string;
  quantity: number;
  priceCents: number;
};

export type DbShopOrder = {
  id: number;
  stripeSessionId: string;
  fullName: string;
  email: string;
  phone: string;
  lineItems: ShopOrderLine[];
  fulfillmentNote: string | null;
  subtotalCents: number;
  paymentPlan: string;
  paidAt: string;
  status: ShopOrderStatus;
  internalNotes: string | null;
  fulfillmentUpdatedAt: string | null;
  createdAt: string;
};
