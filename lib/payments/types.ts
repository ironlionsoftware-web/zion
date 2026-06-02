export type PaymentPlan = "full" | "installments";

export function parsePaymentPlan(value: unknown): PaymentPlan {
  return value === "installments" ? "installments" : "full";
}
