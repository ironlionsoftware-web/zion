import { NextResponse } from "next/server";
import { normalizePath } from "@/lib/analytics/path-labels";
import { recordPageView } from "@/lib/db/page-views";

export async function POST(request: Request) {
  let body: { sessionId?: unknown; path?: unknown; referrer?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const sessionId = typeof body.sessionId === "string" ? body.sessionId.trim().slice(0, 64) : "";
  const path = normalizePath(typeof body.path === "string" ? body.path : "");
  if (!sessionId || !path) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const referrer = typeof body.referrer === "string" ? body.referrer : null;

  try {
    await recordPageView({ sessionId, path, referrer });
  } catch (error) {
    console.error("recordPageView failed:", error);
    return NextResponse.json({ error: "Could not record view." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
