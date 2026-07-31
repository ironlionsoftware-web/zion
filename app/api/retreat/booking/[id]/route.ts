import { NextResponse } from "next/server";
import { getRegistration } from "@/lib/registration/cookie";
import { registrationOwnsBooking } from "@/lib/retreat/booking";
import { getRetreatBooking } from "@/lib/retreat/storage";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  // This route returns every participant's contact and health details, and the booking id travels
  // in Stripe redirect URLs — so possession of the id cannot be the credential. The caller must be
  // signed in as one of the participants.
  const registration = await getRegistration();
  if (!registration) {
    return NextResponse.json({ error: "Please register to view this booking." }, { status: 401 });
  }

  const booking = await getRetreatBooking(id);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  if (!registrationOwnsBooking(booking, registration)) {
    // Same message and status as a missing booking on purpose: telling a stranger that this id
    // exists but belongs to someone else confirms a real booking and leaks who is travelling.
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  return NextResponse.json({ booking });
}
