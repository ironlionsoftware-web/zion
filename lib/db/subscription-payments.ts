import { usesPostgres, withPostgres, withSqlite } from "./client";
import type { DbSubscriptionPayment } from "./types";

export type InsertSubscriptionPaymentInput = {
  stripeInvoiceId: string;
  stripeSubscriptionId: string;
  email: string;
  serviceSlug: string;
  serviceLabel: string;
  practitionerSlug?: string;
  practitionerName?: string;
  planSummary?: string;
  amountCents: number;
  paidAt: string;
};

function mapRow(row: Record<string, unknown>): DbSubscriptionPayment {
  const optional = (a: unknown, b: unknown) => (a != null || b != null ? String(a ?? b) : null);
  return {
    id: Number(row.id),
    stripeInvoiceId: String(row.stripe_invoice_id ?? row.stripeInvoiceId),
    stripeSubscriptionId: String(row.stripe_subscription_id ?? row.stripeSubscriptionId),
    email: String(row.email),
    serviceSlug: String(row.service_slug ?? row.serviceSlug),
    serviceLabel: String(row.service_label ?? row.serviceLabel),
    practitionerSlug: optional(row.practitioner_slug, row.practitionerSlug),
    practitionerName: optional(row.practitioner_name, row.practitionerName),
    planSummary: optional(row.plan_summary, row.planSummary),
    amountCents: Number(row.amount_cents ?? row.amountCents),
    paidAt: String(row.paid_at ?? row.paidAt),
    createdAt: String(row.created_at ?? row.createdAt),
  };
}

/**
 * Records one recurring payment.
 *
 * Returns `null` when this invoice was already recorded. Stripe retries webhooks, and the unique
 * constraint on `stripe_invoice_id` makes that safe — callers can use the null return to avoid
 * sending a duplicate notification, the same idempotency pattern as `insertServiceBooking`.
 */
export async function insertSubscriptionPayment(
  input: InsertSubscriptionPaymentInput,
): Promise<DbSubscriptionPayment | null> {
  if (usesPostgres()) {
    try {
      const [row] = await withPostgres((sql) =>
        sql<Record<string, unknown>[]>`
          INSERT INTO subscription_payments (
            stripe_invoice_id, stripe_subscription_id, email,
            service_slug, service_label, practitioner_slug, practitioner_name,
            plan_summary, amount_cents, paid_at
          ) VALUES (
            ${input.stripeInvoiceId},
            ${input.stripeSubscriptionId},
            ${input.email},
            ${input.serviceSlug},
            ${input.serviceLabel},
            ${input.practitionerSlug ?? null},
            ${input.practitionerName ?? null},
            ${input.planSummary ?? null},
            ${input.amountCents},
            ${input.paidAt}
          )
          ON CONFLICT (stripe_invoice_id) DO NOTHING
          RETURNING *
        `,
      );
      return row ? mapRow(row) : null;
    } catch (error) {
      console.error("insertSubscriptionPayment failed:", error);
      return null;
    }
  }

  return withSqlite((db) => {
    try {
      const existing = db
        .prepare(`SELECT id FROM subscription_payments WHERE stripe_invoice_id = ?`)
        .get(input.stripeInvoiceId);
      if (existing) return null;

      const result = db
        .prepare(
          `INSERT INTO subscription_payments (
            stripe_invoice_id, stripe_subscription_id, email,
            service_slug, service_label, practitioner_slug, practitioner_name,
            plan_summary, amount_cents, paid_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          input.stripeInvoiceId,
          input.stripeSubscriptionId,
          input.email,
          input.serviceSlug,
          input.serviceLabel,
          input.practitionerSlug ?? null,
          input.practitionerName ?? null,
          input.planSummary ?? null,
          input.amountCents,
          input.paidAt,
        );
      const row = db
        .prepare(`SELECT * FROM subscription_payments WHERE id = ?`)
        .get(result.lastInsertRowid) as Record<string, unknown>;
      return mapRow(row);
    } catch (error) {
      console.error("insertSubscriptionPayment failed:", error);
      return null;
    }
  });
}

export async function listSubscriptionPayments(
  options: { limit?: number; offset?: number } = {},
): Promise<DbSubscriptionPayment[]> {
  const limit = Math.min(options.limit ?? 500, 1000);
  const offset = options.offset ?? 0;

  if (usesPostgres()) {
    const rows = await withPostgres((sql) =>
      sql<Record<string, unknown>[]>`
        SELECT * FROM subscription_payments ORDER BY paid_at DESC LIMIT ${limit} OFFSET ${offset}
      `,
    );
    return rows.map(mapRow);
  }

  return withSqlite((db) => {
    const rows = db
      .prepare(`SELECT * FROM subscription_payments ORDER BY paid_at DESC LIMIT ? OFFSET ?`)
      .all(limit, offset) as Record<string, unknown>[];
    return rows.map(mapRow);
  });
}
