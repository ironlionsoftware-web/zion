import { usesPostgres, withPostgres, withSqlite } from "./client";
import type { DbServiceBooking } from "./types";

export type InsertServiceBookingInput = {
  stripeSessionId: string;
  fullName: string;
  email: string;
  phone: string;
  serviceSlug: string;
  serviceLabel: string;
  practitionerSlug: string;
  practitionerName: string;
  ceremonyMedicineSlug?: string;
  ceremonyMedicineLabel?: string;
  amountCents: number;
  paymentPlan: string;
  paidAt: string;
};

function mapRow(row: Record<string, unknown>): DbServiceBooking {
  return {
    id: Number(row.id),
    stripeSessionId: String(row.stripe_session_id ?? row.stripeSessionId),
    fullName: String(row.full_name ?? row.fullName),
    email: String(row.email),
    phone: String(row.phone),
    serviceSlug: String(row.service_slug ?? row.serviceSlug),
    serviceLabel: String(row.service_label ?? row.serviceLabel),
    practitionerSlug: String(row.practitioner_slug ?? row.practitionerSlug),
    practitionerName: String(row.practitioner_name ?? row.practitionerName),
    ceremonyMedicineSlug: row.ceremony_medicine_slug != null || row.ceremonyMedicineSlug != null
      ? String(row.ceremony_medicine_slug ?? row.ceremonyMedicineSlug)
      : null,
    ceremonyMedicineLabel: row.ceremony_medicine_label != null || row.ceremonyMedicineLabel != null
      ? String(row.ceremony_medicine_label ?? row.ceremonyMedicineLabel)
      : null,
    amountCents: Number(row.amount_cents ?? row.amountCents),
    paymentPlan: String(row.payment_plan ?? row.paymentPlan),
    paidAt: String(row.paid_at ?? row.paidAt),
    createdAt: String(row.created_at ?? row.createdAt),
  };
}

export async function insertServiceBooking(
  input: InsertServiceBookingInput,
): Promise<DbServiceBooking | null> {
  if (usesPostgres()) {
    try {
      const [row] = await withPostgres((sql) =>
        sql<Record<string, unknown>[]>`
          INSERT INTO service_bookings (
            stripe_session_id, full_name, email, phone,
            service_slug, service_label, practitioner_slug, practitioner_name,
            ceremony_medicine_slug, ceremony_medicine_label,
            amount_cents, payment_plan, paid_at
          ) VALUES (
            ${input.stripeSessionId},
            ${input.fullName},
            ${input.email},
            ${input.phone},
            ${input.serviceSlug},
            ${input.serviceLabel},
            ${input.practitionerSlug},
            ${input.practitionerName},
            ${input.ceremonyMedicineSlug ?? null},
            ${input.ceremonyMedicineLabel ?? null},
            ${input.amountCents},
            ${input.paymentPlan},
            ${input.paidAt}
          )
          ON CONFLICT (stripe_session_id) DO NOTHING
          RETURNING *
        `,
      );
      return row ? mapRow(row) : null;
    } catch {
      return null;
    }
  }

  return withSqlite((db) => {
    try {
      const existing = db
        .prepare(`SELECT id FROM service_bookings WHERE stripe_session_id = ?`)
        .get(input.stripeSessionId);
      if (existing) return null;

      const result = db
        .prepare(
          `INSERT INTO service_bookings (
            stripe_session_id, full_name, email, phone,
            service_slug, service_label, practitioner_slug, practitioner_name,
            ceremony_medicine_slug, ceremony_medicine_label,
            amount_cents, payment_plan, paid_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          input.stripeSessionId,
          input.fullName,
          input.email,
          input.phone,
          input.serviceSlug,
          input.serviceLabel,
          input.practitionerSlug,
          input.practitionerName,
          input.ceremonyMedicineSlug ?? null,
          input.ceremonyMedicineLabel ?? null,
          input.amountCents,
          input.paymentPlan,
          input.paidAt,
        );
      const row = db.prepare(`SELECT * FROM service_bookings WHERE id = ?`).get(result.lastInsertRowid) as Record<
        string,
        unknown
      >;
      return mapRow(row);
    } catch {
      return null;
    }
  });
}

export async function getServiceBookingBySessionId(sessionId: string): Promise<DbServiceBooking | null> {
  if (usesPostgres()) {
    const [row] = await withPostgres((sql) =>
      sql<Record<string, unknown>[]>`
        SELECT * FROM service_bookings WHERE stripe_session_id = ${sessionId}
      `,
    );
    return row ? mapRow(row) : null;
  }

  return withSqlite((db) => {
    const row = db
      .prepare(`SELECT * FROM service_bookings WHERE stripe_session_id = ?`)
      .get(sessionId) as Record<string, unknown> | undefined;
    return row ? mapRow(row) : null;
  });
}

export type ListServiceBookingsOptions = {
  search?: string;
  limit?: number;
  offset?: number;
};

export async function listServiceBookings(
  options: ListServiceBookingsOptions = {},
): Promise<DbServiceBooking[]> {
  const limit = Math.min(options.limit ?? 500, 1000);
  const offset = options.offset ?? 0;
  const search = options.search?.trim().toLowerCase();

  if (usesPostgres()) {
    if (search) {
      const pattern = `%${search}%`;
      const rows = await withPostgres((sql) =>
        sql<Record<string, unknown>[]>`
          SELECT * FROM service_bookings
          WHERE LOWER(full_name) LIKE ${pattern}
             OR LOWER(email) LIKE ${pattern}
             OR LOWER(service_label) LIKE ${pattern}
             OR LOWER(practitioner_name) LIKE ${pattern}
          ORDER BY paid_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `,
      );
      return rows.map(mapRow);
    }
    const rows = await withPostgres((sql) =>
      sql<Record<string, unknown>[]>`
        SELECT * FROM service_bookings ORDER BY paid_at DESC LIMIT ${limit} OFFSET ${offset}
      `,
    );
    return rows.map(mapRow);
  }

  return withSqlite((db) => {
    if (search) {
      const pattern = `%${search}%`;
      const rows = db
        .prepare(
          `SELECT * FROM service_bookings
           WHERE LOWER(full_name) LIKE ?
              OR LOWER(email) LIKE ?
              OR LOWER(service_label) LIKE ?
              OR LOWER(practitioner_name) LIKE ?
           ORDER BY paid_at DESC LIMIT ? OFFSET ?`,
        )
        .all(pattern, pattern, pattern, pattern, limit, offset) as Record<string, unknown>[];
      return rows.map(mapRow);
    }
    const rows = db
      .prepare(`SELECT * FROM service_bookings ORDER BY paid_at DESC LIMIT ? OFFSET ?`)
      .all(limit, offset) as Record<string, unknown>[];
    return rows.map(mapRow);
  });
}
