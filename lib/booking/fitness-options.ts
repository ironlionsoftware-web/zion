import { site } from "@/content/site";

export type FitnessSessionType = (typeof site.fitnessTraining.booking.sessionTypes)[number]["slug"];
export type FitnessAudience = (typeof site.fitnessTraining.booking.audienceTypes)[number]["slug"];
export type FitnessBillingMode = (typeof site.fitnessTraining.booking.billingModes)[number]["slug"];

export type FitnessBookingOptions = {
  sessionType: FitnessSessionType;
  audience: FitnessAudience;
  sessionsPerWeek: number;
  billingMode: FitnessBillingMode;
};

export function getFitnessSessionTypes() {
  return site.fitnessTraining.booking.sessionTypes;
}

export function getFitnessAudienceTypes() {
  return site.fitnessTraining.booking.audienceTypes;
}

export function getFitnessSessionsPerWeekOptions() {
  return site.fitnessTraining.booking.sessionsPerWeekOptions;
}

export function getFitnessBillingModes() {
  return site.fitnessTraining.booking.billingModes;
}

export function getDefaultFitnessBookingOptions(): FitnessBookingOptions {
  const cfg = site.fitnessTraining.booking;
  return {
    sessionType: cfg.sessionTypes[0]!.slug,
    audience: cfg.audienceTypes[0]!.slug,
    sessionsPerWeek: cfg.sessionsPerWeekOptions[0]!,
    billingMode: cfg.billingModes[0]!.slug,
  };
}

export function parseFitnessSessionType(value: string | undefined): FitnessSessionType | undefined {
  const normalized = value?.trim().toLowerCase() ?? "";
  return getFitnessSessionTypes().find((item) => item.slug === normalized)?.slug;
}

export function parseFitnessAudience(value: string | undefined): FitnessAudience | undefined {
  const normalized = value?.trim().toLowerCase() ?? "";
  return getFitnessAudienceTypes().find((item) => item.slug === normalized)?.slug;
}

export function parseFitnessSessionsPerWeek(value: string | number | undefined): number | undefined {
  const raw = typeof value === "number" ? value : Number(value?.trim());
  if (!Number.isInteger(raw) || raw < 1) return undefined;
  const allowed = getFitnessSessionsPerWeekOptions();
  return allowed.some((count) => count === raw) ? raw : undefined;
}

export function parseFitnessBillingMode(value: string | undefined): FitnessBillingMode | undefined {
  const normalized = value?.trim().toLowerCase() ?? "";
  return getFitnessBillingModes().find((item) => item.slug === normalized)?.slug;
}

export function parseFitnessBookingOptions(input: {
  session?: string;
  audience?: string;
  frequency?: string | number;
  billing?: string;
}): FitnessBookingOptions | undefined {
  const sessionType = parseFitnessSessionType(input.session);
  const audience = parseFitnessAudience(input.audience);
  const sessionsPerWeek = parseFitnessSessionsPerWeek(input.frequency);
  const billingMode = parseFitnessBillingMode(input.billing);
  if (!sessionType || !audience || sessionsPerWeek == null || !billingMode) return undefined;
  return { sessionType, audience, sessionsPerWeek, billingMode };
}

export function serializeFitnessBookingOptions(options: FitnessBookingOptions): URLSearchParams {
  const params = new URLSearchParams();
  params.set("session", options.sessionType);
  params.set("audience", options.audience);
  params.set("frequency", String(options.sessionsPerWeek));
  params.set("billing", options.billingMode);
  return params;
}

export function appendFitnessBookingOptions(
  params: URLSearchParams,
  options: FitnessBookingOptions,
): URLSearchParams {
  params.set("session", options.sessionType);
  params.set("audience", options.audience);
  params.set("frequency", String(options.sessionsPerWeek));
  params.set("billing", options.billingMode);
  return params;
}

export function getFitnessSessionTypeLabel(slug: FitnessSessionType): string {
  return getFitnessSessionTypes().find((item) => item.slug === slug)?.label ?? slug;
}

export function getFitnessAudienceLabel(slug: FitnessAudience): string {
  return getFitnessAudienceTypes().find((item) => item.slug === slug)?.label ?? slug;
}

export function getFitnessBillingModeLabel(slug: FitnessBillingMode): string {
  return getFitnessBillingModes().find((item) => item.slug === slug)?.label ?? slug;
}

export function formatFitnessBookingSummary(options: FitnessBookingOptions): string {
  const session = getFitnessSessionTypeLabel(options.sessionType);
  const audience = getFitnessAudienceLabel(options.audience);
  const frequency =
    options.sessionsPerWeek === 1
      ? "1 session per week"
      : `${options.sessionsPerWeek} sessions per week`;
  const billing = getFitnessBillingModeLabel(options.billingMode);
  return `${session} · ${audience} · ${frequency} · ${billing}`;
}

export function isFitnessRecurringBilling(options: FitnessBookingOptions): boolean {
  return options.billingMode === "recurring";
}

export function computeFitnessWeeklyRecurringCents(
  perSessionCents: number,
  sessionsPerWeek: number,
): number {
  return perSessionCents * sessionsPerWeek;
}
