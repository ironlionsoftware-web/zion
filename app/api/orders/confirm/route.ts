import { NextResponse } from "next/server";
import { getServiceBookingBySessionId } from "@/lib/db/service-bookings";
import { getShopOrderBySessionId } from "@/lib/db/shop-orders";
import { persistCheckoutSession } from "@/lib/orders/persist-checkout";
import { getStripe } from "@/lib/stripe/server";

export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Payments are not configured." }, { status: 503 });
  }

  let body: { sessionId?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const sessionId = typeof body.sessionId === "string" ? body.sessionId.trim() : "";
  if (!sessionId) {
    return NextResponse.json({ error: "Missing session." }, { status: 400 });
  }

  const existingService = await getServiceBookingBySessionId(sessionId);
  const existingShop = await getShopOrderBySessionId(sessionId);
  if (existingService) {
    return NextResponse.json({ type: "service", booking: existingService });
  }
  if (existingShop) {
    return NextResponse.json({ type: "shop", order: existingShop });
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid") {
    return NextResponse.json({ error: "Payment not completed." }, { status: 400 });
  }

  await persistCheckoutSession(session);

  const checkoutType = session.metadata?.checkout_type;
  if (checkoutType === "donation") {
    return NextResponse.json({ type: "donation", ok: true });
  }
  if (checkoutType === "retreat_deposit" || checkoutType === "retreat_balance") {
    return NextResponse.json({ type: "retreat", ok: true });
  }

  const service = await getServiceBookingBySessionId(sessionId);
  if (service) {
    return NextResponse.json({ type: "service", booking: service });
  }

  const order = await getShopOrderBySessionId(sessionId);
  if (order) {
    return NextResponse.json({ type: "shop", order });
  }

  return NextResponse.json({ error: "Could not record order." }, { status: 500 });
}
