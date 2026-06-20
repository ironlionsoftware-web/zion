import type { RegisterNext } from "@/lib/registration/types";

export type RegistrationRedirectOptions = {
  next: RegisterNext;
  service?: string;
  booking?: string;
  participant?: number;
  practitioner?: string;
  ceremony?: string;
  addon?: string;
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
  return `/register?${params.toString()}`;
}
