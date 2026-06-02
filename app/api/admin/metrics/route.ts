import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/require-admin";
import { getAdminMetrics } from "@/lib/db/metrics";

export async function GET(request: Request) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const url = new URL(request.url);
  const days = Number(url.searchParams.get("days") ?? 30);
  const periodDays = Number.isInteger(days) && days >= 7 && days <= 90 ? days : 30;

  const metrics = await getAdminMetrics(periodDays);
  return NextResponse.json({ metrics });
}
