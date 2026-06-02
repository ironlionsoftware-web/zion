import { cartSubtotalCents, formatUsd, resolveCartLines } from "./products";
import type { CartLine } from "./types";
import { site } from "@/content/site";
import type { ClientRegistration } from "@/lib/registration/types";

export function buildCartOrderMailto(
  items: CartLine[],
  client: ClientRegistration,
  fulfillmentNote: string,
): string {
  const lines = resolveCartLines(items);
  const subtotal = cartSubtotalCents(lines);

  const itemLines = lines.map(
    (line) => `• ${line.name} × ${line.quantity}: ${formatUsd(line.lineTotalCents)}`,
  );

  const body = [
    "Hi Iron Lion,",
    "",
    "I would like to place the following order:",
    "",
    ...itemLines,
    "",
    `Subtotal (excl. tax): ${formatUsd(subtotal)}`,
    "",
    `Name: ${client.fullName}`,
    `Email: ${client.email}`,
    `Phone: ${client.phone}`,
    "",
    "Pickup or shipping:",
    fulfillmentNote.trim() || "(not specified)",
    "",
    "Thank you.",
  ].join("\n");

  const subject = `Shop order from ${client.fullName}`;
  return `mailto:${site.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
