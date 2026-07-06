import { NextResponse } from "next/server";
import { getAppUserStats, listAppUsers } from "@/lib/admin/mbs-healing";
import { requireAdmin } from "@/lib/admin/require-admin";

export async function GET(request: Request) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const url = new URL(request.url);
  if (url.searchParams.get("stats") === "1") {
    const result = await getAppUserStats();
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status ?? 503 });
    }
    return NextResponse.json({ stats: result.data });
  }

  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "500", 10) || 500, 500);
  const offset = parseInt(url.searchParams.get("offset") ?? "0", 10) || 0;
  const result = await listAppUsers(limit, offset);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status ?? 503 });
  }
  return NextResponse.json(result.data);
}
