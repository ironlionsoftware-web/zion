import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { RetreatBooking, RetreatParticipant } from "./types";

const DATA_DIR = path.join(process.cwd(), "data", "retreat-bookings");

function bookingPath(id: string): string {
  return path.join(DATA_DIR, `${id}.json`);
}

export async function saveRetreatBooking(booking: RetreatBooking): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(bookingPath(booking.id), `${JSON.stringify(booking, null, 2)}\n`, "utf8");
}

export async function getRetreatBooking(id: string): Promise<RetreatBooking | null> {
  try {
    const raw = await readFile(bookingPath(id), "utf8");
    return JSON.parse(raw) as RetreatBooking;
  } catch {
    return null;
  }
}

export async function updateRetreatParticipant(
  bookingId: string,
  participantIndex: number,
  update: Partial<RetreatParticipant>,
): Promise<RetreatBooking | null> {
  const booking = await getRetreatBooking(bookingId);
  if (!booking || participantIndex < 0 || participantIndex >= booking.participants.length) {
    return null;
  }

  booking.participants[participantIndex] = {
    ...booking.participants[participantIndex],
    ...update,
  };

  await saveRetreatBooking(booking);
  return booking;
}
