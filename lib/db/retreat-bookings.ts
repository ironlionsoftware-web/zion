import type { RetreatBooking, RetreatParticipant } from "@/lib/retreat/types";
import { usesPostgres, withPostgres, withSqlite } from "./client";

/**
 * Retreat bookings are stored as a whole document rather than normalised columns.
 * The booking shape evolves with the retreat offerings (durations, pricing, per-participant
 * payment state) and is always read and written as a unit, so a JSON document keeps the
 * storage layer from needing a migration every time a retreat option changes.
 */

function parse(raw: unknown): RetreatBooking | null {
  if (raw == null) return null;
  try {
    return (typeof raw === "string" ? JSON.parse(raw) : raw) as RetreatBooking;
  } catch {
    return null;
  }
}

export async function upsertRetreatBooking(booking: RetreatBooking): Promise<void> {
  const payload = JSON.stringify(booking);

  if (usesPostgres()) {
    await withPostgres(
      (sql) => sql`
        INSERT INTO retreat_bookings (id, created_at, data)
        VALUES (${booking.id}, ${booking.createdAt}, ${payload}::jsonb)
        ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
      `,
    );
    return;
  }

  await withSqlite((db) => {
    db.prepare(
      `INSERT INTO retreat_bookings (id, created_at, data)
       VALUES (?, ?, ?)
       ON CONFLICT (id) DO UPDATE SET data = excluded.data, updated_at = datetime('now')`,
    ).run(booking.id, booking.createdAt, payload);
  });
}

export async function selectRetreatBooking(id: string): Promise<RetreatBooking | null> {
  if (usesPostgres()) {
    const [row] = await withPostgres(
      (sql) => sql<{ data: unknown }[]>`SELECT data FROM retreat_bookings WHERE id = ${id}`,
    );
    return row ? parse(row.data) : null;
  }

  return withSqlite((db) => {
    const row = db.prepare(`SELECT data FROM retreat_bookings WHERE id = ?`).get(id) as
      | { data: string }
      | undefined;
    return row ? parse(row.data) : null;
  });
}

/**
 * Runs `apply` against a booking under an exclusive lock, persisting whatever it returns.
 *
 * Everything that mutates a booking goes through here. Two participants can pay at the same
 * moment, and the Stripe webhook races the client-side confirmation fallback by design — so a
 * plain read-modify-write would lose writes and double-notify. Postgres holds a row lock for the
 * transaction; SQLite is single-process and better-sqlite3 is synchronous, so an IMMEDIATE
 * transaction is equivalent there.
 *
 * `apply` returns the mutated booking to save it, or `null` to leave the row untouched.
 */
async function transactBooking<T>(
  bookingId: string,
  apply: (booking: RetreatBooking) => { save: RetreatBooking | null; result: T },
  missing: T,
): Promise<T> {
  if (usesPostgres()) {
    return withPostgres((sql) =>
      sql.begin(async (tx) => {
        const [row] = await tx<{ data: unknown }[]>`
          SELECT data FROM retreat_bookings WHERE id = ${bookingId} FOR UPDATE
        `;
        const booking = row ? parse(row.data) : null;
        if (!booking) return missing;

        const { save, result } = apply(booking);
        if (save) {
          await tx`
            UPDATE retreat_bookings
            SET data = ${JSON.stringify(save)}::jsonb, updated_at = NOW()
            WHERE id = ${bookingId}
          `;
        }
        return result;
      }),
    ) as Promise<T>;
  }

  return withSqlite((db) => {
    const run = db.transaction((): T => {
      const row = db.prepare(`SELECT data FROM retreat_bookings WHERE id = ?`).get(bookingId) as
        | { data: string }
        | undefined;
      const booking = row ? parse(row.data) : null;
      if (!booking) return missing;

      const { save, result } = apply(booking);
      if (save) {
        db.prepare(
          `UPDATE retreat_bookings SET data = ?, updated_at = datetime('now') WHERE id = ?`,
        ).run(JSON.stringify(save), bookingId);
      }
      return result;
    });
    return run.immediate();
  });
}

function validIndex(booking: RetreatBooking, index: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < booking.participants.length;
}

/** Applies `update` to a single participant. */
export async function mutateRetreatParticipant(
  bookingId: string,
  participantIndex: number,
  update: Partial<RetreatParticipant>,
): Promise<RetreatBooking | null> {
  return transactBooking<RetreatBooking | null>(
    bookingId,
    (booking) => {
      if (!validIndex(booking, participantIndex)) return { save: null, result: null };
      booking.participants[participantIndex] = {
        ...booking.participants[participantIndex],
        ...update,
      };
      return { save: booking, result: booking };
    },
    null,
  );
}

/**
 * Marks a participant's deposit or balance as paid, exactly once.
 *
 * `claimed` is true only for the caller that actually recorded the payment. The Stripe webhook and
 * the browser's `/api/retreat/confirm-payment` fallback both fire for the same payment, so without
 * an atomic check-and-set both could decide they were first and send duplicate notifications. The
 * check now happens inside the same locked transaction as the write.
 */
export async function claimRetreatParticipantPayment(
  bookingId: string,
  participantIndex: number,
  update: Partial<RetreatParticipant> & { depositPaidAt?: string; balancePaidAt?: string },
): Promise<{ booking: RetreatBooking; claimed: boolean } | null> {
  const field = update.depositPaidAt ? "depositPaidAt" : "balancePaidAt";

  return transactBooking<{ booking: RetreatBooking; claimed: boolean } | null>(
    bookingId,
    (booking) => {
      if (!validIndex(booking, participantIndex)) return { save: null, result: null };

      const participant = booking.participants[participantIndex];
      if (participant[field]) {
        // Someone else already recorded this payment; hand back the booking without re-writing.
        return { save: null, result: { booking, claimed: false } };
      }

      booking.participants[participantIndex] = { ...participant, ...update };
      return { save: booking, result: { booking, claimed: true } };
    },
    null,
  );
}

export async function countRetreatBookings(): Promise<number> {
  if (usesPostgres()) {
    const [row] = await withPostgres(
      (sql) => sql<{ count: string }[]>`SELECT COUNT(*)::text AS count FROM retreat_bookings`,
    );
    return Number(row?.count ?? 0);
  }
  return withSqlite((db) => {
    const row = db.prepare(`SELECT COUNT(*) AS count FROM retreat_bookings`).get() as { count: number };
    return Number(row.count);
  });
}
