import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/require-admin";
import { listRegistrations, registrationsToCsv } from "@/lib/db/registrations";

export async function GET(request: Request) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  const url = new URL(request.url);
  const search = url.searchParams.get("search") ?? undefined;
  const format = url.searchParams.get("format");

  const rows = await listRegistrations({ search });

  if (format === "csv") {
    const csv = registrationsToCsv(rows);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="registrations-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  return NextResponse.json({ registrations: rows });
}
