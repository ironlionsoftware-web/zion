import type { RegisterNext } from "@/lib/registration/types";
import { parseFitnessBookingOptions, type FitnessBookingOptions } from "@/lib/booking/fitness-options";

export type RegistrationRedirectOptions = {
  next: RegisterNext;
  service?: string;
  booking?: string;
  participant?: number;
  practitioner?: string;
  ceremony?: string;
  addon?: string;
  session?: string;
  format?: string;
  group?: string;
  audience?: string;
  frequency?: string;
  billing?: string;
};

export function buildRegisterPath(options: RegistrationRedirectOptions): string {
  const params = new URLSearchParams({ next: options.next });
  if (options.service?.trim()) params.set("service", options.service.trim());
  if (options.booking?.trim()) params.set("booking", options.booking.trim());
  if (options.participant !== undefined && Number.isInteger(options.participant)) {
    params.set("participant", String(options.participant));
  }
  if (options.practitioner?.trim()) params.set("practitioner", options.practitioner.trim());
  if (options.ceremony?.trim()) params.set("ceremony", options.ceremony.trim());
  if (options.addon?.trim()) params.set("addon", options.addon.trim());
  if (options.session?.trim()) params.set("session", options.session.trim());
  if (options.format?.trim()) params.set("format", options.format.trim());
  if (options.group?.trim()) params.set("group", options.group.trim());
  if (options.audience?.trim()) params.set("audience", options.audience.trim());
  if (options.frequency?.trim()) params.set("frequency", options.frequency.trim());
  if (options.billing?.trim()) params.set("billing", options.billing.trim());
  return `/register?${params.toString()}`;
}

export function fitnessOptionsFromRedirect(options: RegistrationRedirectOptions): FitnessBookingOptions | undefined {
  return parseFitnessBookingOptions({
    session: options.session,
    format: options.format,
    group: options.group,
    audience: options.audience,
    frequency: options.frequency,
    billing: options.billing,
  });
}
