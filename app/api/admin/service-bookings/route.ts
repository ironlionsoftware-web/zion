import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/require-admin";
import { listServiceBookings } from "@/lib/db/service-bookings";

export async function GET(request: Request) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  const url = new URL(request.url);
  const search = url.searchParams.get("search") ?? undefined;
  const bookings = await listServiceBookings({ search });
  return NextResponse.json({ bookings });
}
