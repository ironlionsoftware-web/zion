import { NextResponse } from "next/server";
import { validateContactInput } from "@/lib/contact/validate";
import { notifyAdmin } from "@/lib/notifications/email";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const validated = validateContactInput(body);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const { fullName, email, phone, message } = validated.data;
  const sent = await notifyAdmin({
    subject: `Contact form: ${fullName}`,
    replyTo: email,
    text: [
      "New message from the Iron Lion contact form:",
      "",
      `Name: ${fullName}`,
      `Email: ${email}`,
      `Phone: ${phone}`,
      "",
      "Message:",
      message,
    ].join("\n"),
  });

  if (!sent) {
    return NextResponse.json(
      {
        error:
          "We could not send your message right now. Please email us directly or try again in a few minutes.",
      },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true });
}
