import { NextResponse } from "next/server";
import { getRetreatBooking } from "@/lib/retreat/storage";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const booking = await getRetreatBooking(id);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }
  return NextResponse.json({ booking });
}
