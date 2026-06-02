import { NextResponse } from "next/server";
import { confirmRetreatPayment } from "@/lib/orders/retreat-payment";
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

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const result = await confirmRetreatPayment(session);
  if (!result) {
    return NextResponse.json({ error: "Invalid payment session." }, { status: 400 });
  }

  return NextResponse.json({ booking: result.booking, paymentType: result.paymentType });
}
