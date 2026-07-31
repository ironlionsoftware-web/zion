import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, describe, it } from "node:test";
import {
  claimRetreatParticipantPayment,
  countRetreatBookings,
  mutateRetreatParticipant,
  selectRetreatBooking,
  upsertRetreatBooking,
} from "@/lib/db/retreat-bookings";
import type { RetreatBooking } from "@/lib/retreat/types";

/**
 * Retreats are the highest-value product on the site ($2,500–$5,000 per person).
 *
 * These bookings used to be written as JSON files on disk, which cannot work on Vercel: the
 * filesystem is read-only outside /tmp and each request may land on a different instance, so a
 * booking saved by one request was invisible to the next. These tests run against the local
 * SQLite backend and exist to stop anyone reintroducing file storage, and to hold the payment
 * claim atomic.
 */

const created: string[] = [];

function makeBooking(): RetreatBooking {
  const booking: RetreatBooking = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    retreatTypeSlug: "couples-bonding-healing",
    retreatTypeLabel: "Couples Therapy / Bonding Retreat",
    totalCents: 500_000,
    depositCents: 50_000,
    balanceCents: 450_000,
    participants: [
      {
        fullName: "Ada Test",
        email: "ada@example.com",
        phone: "5125550111",
        marketingConsent: true,
        age: 34,
        dietaryRestrictionsAndAllergies: "none",
        fitnessMobilityLevel: "high",
      },
      {
        fullName: "Grace Test",
        email: "grace@example.com",
        phone: "5125550112",
        marketingConsent: false,
        age: 41,
        dietaryRestrictionsAndAllergies: "gluten free",
        fitnessMobilityLevel: "moderate",
      },
    ],
  };
  created.push(booking.id);
  return booking;
}

after(async () => {
  const { usesPostgres, withPostgres, withSqlite } = await import("@/lib/db/client");
  for (const id of created) {
    if (usesPostgres()) {
      await withPostgres((sql) => sql`DELETE FROM retreat_bookings WHERE id = ${id}`);
    } else {
      await withSqlite((db) => db.prepare(`DELETE FROM retreat_bookings WHERE id = ?`).run(id));
    }
  }
});

describe("retreat booking storage", () => {
  it("survives a save and reload", async () => {
    const booking = makeBooking();
    await upsertRetreatBooking(booking);

    const loaded = await selectRetreatBooking(booking.id);
    assert.ok(loaded, "booking must come back");
    assert.equal(loaded.participants.length, 2);
    assert.equal(loaded.participants[1].dietaryRestrictionsAndAllergies, "gluten free");
  });

  it("preserves the agreed price exactly", async () => {
    const booking = makeBooking();
    await upsertRetreatBooking(booking);

    const loaded = await selectRetreatBooking(booking.id);
    assert.equal(loaded?.totalCents, 500_000);
    assert.equal(loaded?.depositCents, 50_000);
    assert.equal(loaded?.balanceCents, 450_000);
  });

  it("returns null for a booking that does not exist", async () => {
    assert.equal(await selectRetreatBooking(randomUUID()), null);
  });

  it("is queryable, so bookings can be counted and reconciled", async () => {
    const booking = makeBooking();
    await upsertRetreatBooking(booking);
    assert.ok((await countRetreatBookings()) >= 1);
  });
});

describe("participant updates", () => {
  it("updates one participant without disturbing the other", async () => {
    const booking = makeBooking();
    await upsertRetreatBooking(booking);

    const updated = await mutateRetreatParticipant(booking.id, 0, { depositPaidAt: "2026-07-30T00:00:00.000Z" });
    assert.equal(updated?.participants[0].depositPaidAt, "2026-07-30T00:00:00.000Z");
    assert.equal(updated?.participants[1].depositPaidAt, undefined);
  });

  it("rejects an out-of-range participant index", async () => {
    const booking = makeBooking();
    await upsertRetreatBooking(booking);

    assert.equal(await mutateRetreatParticipant(booking.id, 99, { depositPaidAt: "x" }), null);
    assert.equal(await mutateRetreatParticipant(booking.id, -1, { depositPaidAt: "x" }), null);
  });

  it("returns null for an unknown booking", async () => {
    assert.equal(await mutateRetreatParticipant(randomUUID(), 0, { depositPaidAt: "x" }), null);
  });
});

describe("payment claims are exactly-once", () => {
  it("lets the first caller claim and refuses the second", async () => {
    const booking = makeBooking();
    await upsertRetreatBooking(booking);

    const first = await claimRetreatParticipantPayment(booking.id, 0, { depositPaidAt: "2026-07-30T10:00:00.000Z" });
    assert.equal(first?.claimed, true);

    // The Stripe webhook and the browser's confirm-payment fallback both fire for one payment.
    // Only one of them may send the confirmation emails.
    const second = await claimRetreatParticipantPayment(booking.id, 0, { depositPaidAt: "2026-07-30T10:00:05.000Z" });
    assert.equal(second?.claimed, false);
    assert.equal(
      second?.booking.participants[0].depositPaidAt,
      "2026-07-30T10:00:00.000Z",
      "the original timestamp must survive",
    );
  });

  it("tracks deposit and balance independently", async () => {
    const booking = makeBooking();
    await upsertRetreatBooking(booking);

    assert.equal((await claimRetreatParticipantPayment(booking.id, 0, { depositPaidAt: "d" }))?.claimed, true);
    assert.equal(
      (await claimRetreatParticipantPayment(booking.id, 0, { balancePaidAt: "b", balancePaymentPlan: "full" }))?.claimed,
      true,
      "paying the deposit must not block the balance",
    );

    const loaded = await selectRetreatBooking(booking.id);
    assert.equal(loaded?.participants[0].depositPaidAt, "d");
    assert.equal(loaded?.participants[0].balancePaidAt, "b");
  });

  it("survives both participants paying at once", async () => {
    const booking = makeBooking();
    await upsertRetreatBooking(booking);

    await Promise.all([
      claimRetreatParticipantPayment(booking.id, 0, { depositPaidAt: "ada-paid" }),
      claimRetreatParticipantPayment(booking.id, 1, { depositPaidAt: "grace-paid" }),
    ]);

    // A plain read-modify-write would lose whichever write landed first.
    const loaded = await selectRetreatBooking(booking.id);
    assert.equal(loaded?.participants[0].depositPaidAt, "ada-paid");
    assert.equal(loaded?.participants[1].depositPaidAt, "grace-paid");
  });

  it("only ever lets one of two simultaneous claims win", async () => {
    const booking = makeBooking();
    await upsertRetreatBooking(booking);

    const results = await Promise.all([
      claimRetreatParticipantPayment(booking.id, 0, { depositPaidAt: "first" }),
      claimRetreatParticipantPayment(booking.id, 0, { depositPaidAt: "second" }),
    ]);

    assert.equal(results.filter((r) => r?.claimed).length, 1, "exactly one caller may claim the payment");
  });

  it("returns null for an unknown booking", async () => {
    assert.equal(await claimRetreatParticipantPayment(randomUUID(), 0, { depositPaidAt: "x" }), null);
  });
});
