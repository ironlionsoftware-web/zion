import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/require-admin";
import { listShopOrders, updateShopOrderStatus } from "@/lib/db/shop-orders";
import type { ShopOrderStatus } from "@/lib/db/types";

export async function GET(request: Request) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  const url = new URL(request.url);
  const search = url.searchParams.get("search") ?? undefined;
  const statusParam = url.searchParams.get("status");
  const status =
    statusParam === "pending" || statusParam === "fulfilled" ? (statusParam as ShopOrderStatus) : undefined;

  const orders = await listShopOrders({ search, status });
  return NextResponse.json({ orders });
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  let body: { id?: unknown; status?: unknown; internalNotes?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const id = Number(body.id);
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ error: "Invalid order id." }, { status: 400 });
  }

  const status =
    body.status === "pending" || body.status === "fulfilled" ? (body.status as ShopOrderStatus) : undefined;
  const internalNotes =
    typeof body.internalNotes === "string" ? body.internalNotes.trim().slice(0, 2000) : undefined;

  const order = await updateShopOrderStatus(id, {
    status,
    internalNotes: internalNotes !== undefined ? internalNotes || null : undefined,
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  return NextResponse.json({ order });
}
