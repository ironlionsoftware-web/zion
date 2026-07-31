import {
  mutateRetreatParticipant,
  selectRetreatBooking,
  upsertRetreatBooking,
} from "@/lib/db/retreat-bookings";
import type { RetreatBooking, RetreatParticipant } from "./types";

/**
 * Retreat bookings live in the database, not on disk.
 *
 * These previously wrote JSON files under `process.cwd()/data/retreat-bookings`. That works
 * locally and fails in production: Vercel's filesystem is read-only outside /tmp, and every
 * request may be served by a different instance, so a booking written by one request is not
 * visible to the next. Retreats are the highest-value product on the site, so they get the same
 * durable storage as everything else. Any existing JSON files are imported on first boot — see
 * `migrateRetreatBookingFiles` in `lib/db/client.ts`.
 */

export async function saveRetreatBooking(booking: RetreatBooking): Promise<void> {
  await upsertRetreatBooking(booking);
}

export async function getRetreatBooking(id: string): Promise<RetreatBooking | null> {
  return selectRetreatBooking(id);
}

export async function updateRetreatParticipant(
  bookingId: string,
  participantIndex: number,
  update: Partial<RetreatParticipant>,
): Promise<RetreatBooking | null> {
  return mutateRetreatParticipant(bookingId, participantIndex, update);
}
