import { insertRegistration } from "@/lib/db/registrations";
import { notifyAdmin } from "@/lib/notifications/email";
import type { RegistrationRecord } from "./types";

export async function saveRegistration(record: RegistrationRecord): Promise<void> {
  await insertRegistration(record);

  const webhook = process.env.REGISTER_WEBHOOK_URL?.trim();
  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
      });
    } catch (error) {
      console.error("REGISTER_WEBHOOK_URL failed:", error);
    }
  }

  void notifyAdmin({
    subject: `New registration: ${record.fullName}`,
    text: [
      `Name: ${record.fullName}`,
      `Email: ${record.email}`,
      `Phone: ${record.phone}`,
      `Next step: ${record.next}`,
      record.service ? `Service: ${record.service}` : null,
      record.practitioner ? `Practitioner: ${record.practitioner}` : null,
      `Source: ${record.source}`,
      `Marketing consent: ${record.marketingConsent ? "yes" : "no"}`,
    ]
      .filter(Boolean)
      .join("\n"),
  });
}
