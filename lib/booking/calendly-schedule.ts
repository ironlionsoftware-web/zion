import { site } from "@/content/site";
import { calendlyUrlWithPrefill } from "@/lib/registration/redirect";
import type { ClientRegistration } from "@/lib/registration/types";

export type ScheduledSlot = {
  startTime: string;
  endTime: string;
  eventUri: string;
};

export function buildCalendlyEmbedUrl(
  registration: ClientRegistration,
  practitionerSlug: string,
): string {
  const url = new URL(calendlyUrlWithPrefill(registration, practitionerSlug));
  url.searchParams.set("embed_type", "Inline");
  url.searchParams.set("hide_gdpr_banner", "1");
  try {
    url.searchParams.set("embed_domain", new URL(site.url).hostname);
  } catch {
    /* ignore invalid site.url during local dev */
  }
  return url.toString();
}

export function parseScheduledSlot(input: {
  scheduledStart?: unknown;
  scheduledEnd?: unknown;
  calendlyEventUri?: unknown;
}): ScheduledSlot | undefined {
  const startTime = typeof input.scheduledStart === "string" ? input.scheduledStart.trim() : "";
  const endTime = typeof input.scheduledEnd === "string" ? input.scheduledEnd.trim() : "";
  const eventUri = typeof input.calendlyEventUri === "string" ? input.calendlyEventUri.trim() : "";
  if (!startTime || !endTime || !eventUri) return undefined;

  const start = new Date(startTime);
  const end = new Date(endTime);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return undefined;
  if (!/^https:\/\/(api\.)?calendly\.com\//i.test(eventUri)) return undefined;

  return { startTime: start.toISOString(), endTime: end.toISOString(), eventUri };
}

export function formatScheduledSlot(slot: ScheduledSlot, timeZone = "America/Chicago"): string {
  const start = new Date(slot.startTime);
  const end = new Date(slot.endTime);
  const date = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(start);
  const startTime = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  }).format(start);
  const endTime = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(end);
  return `${date} · ${startTime} – ${endTime}`;
}

export function scheduledSlotMetadata(slot: ScheduledSlot): Record<string, string> {
  return {
    scheduled_start: slot.startTime,
    scheduled_end: slot.endTime,
    calendly_event_uri: slot.eventUri,
    scheduled_label: formatScheduledSlot(slot),
  };
}
