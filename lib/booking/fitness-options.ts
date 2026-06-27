import { site } from "@/content/site";

export type FitnessSessionType = (typeof site.fitnessTraining.booking.sessionTypes)[number]["slug"];
export type FitnessTrainingFormat = (typeof site.fitnessTraining.booking.trainingFormats)[number]["slug"];
export type FitnessAudience = (typeof site.fitnessTraining.booking.audienceTypes)[number]["slug"];
export type FitnessBillingMode = (typeof site.fitnessTraining.booking.billingModes)[number]["slug"];

export type FitnessBookingOptions = {
  sessionType: FitnessSessionType;
  trainingFormat: FitnessTrainingFormat;
  groupSize: number;
  audience: FitnessAudience;
  sessionsPerWeek: number;
  billingMode: FitnessBillingMode;
};

export function getFitnessSessionTypes() {
  return site.fitnessTraining.booking.sessionTypes;
}

export function getFitnessTrainingFormats() {
  return site.fitnessTraining.booking.trainingFormats;
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

export function getFitnessGroupSizeOptions(): number[] {
  const { minSize, maxSize } = site.fitnessTraining.booking.groupTraining;
  return Array.from({ length: maxSize - minSize + 1 }, (_, index) => minSize + index);
}

export function getFitnessGroupPerPersonCents(): number {
  return site.fitnessTraining.booking.groupTraining.perPersonCents;
}

export function getDefaultFitnessBookingOptions(): FitnessBookingOptions {
  const cfg = site.fitnessTraining.booking;
  return {
    sessionType: cfg.sessionTypes[0]!.slug,
    trainingFormat: cfg.trainingFormats[0]!.slug,
    groupSize: cfg.groupTraining.minSize,
    audience: cfg.audienceTypes[0]!.slug,
    sessionsPerWeek: cfg.sessionsPerWeekOptions[0]!,
    billingMode: cfg.billingModes[0]!.slug,
  };
}

export function parseFitnessSessionType(value: string | undefined): FitnessSessionType | undefined {
  const normalized = value?.trim().toLowerCase() ?? "";
  return getFitnessSessionTypes().find((item) => item.slug === normalized)?.slug;
}

export function parseFitnessTrainingFormat(value: string | undefined): FitnessTrainingFormat | undefined {
  const normalized = value?.trim().toLowerCase() ?? "";
  return getFitnessTrainingFormats().find((item) => item.slug === normalized)?.slug;
}

export function parseFitnessGroupSize(value: string | number | undefined): number | undefined {
  const raw = typeof value === "number" ? value : Number(value?.trim());
  if (!Number.isInteger(raw)) return undefined;
  return getFitnessGroupSizeOptions().some((size) => size === raw) ? raw : undefined;
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
  format?: string;
  group?: string | number;
  audience?: string;
  frequency?: string | number;
  billing?: string;
}): FitnessBookingOptions | undefined {
  const sessionType = parseFitnessSessionType(input.session);
  const trainingFormat = parseFitnessTrainingFormat(input.format) ?? "individual";
  const audience = parseFitnessAudience(input.audience);
  const sessionsPerWeek = parseFitnessSessionsPerWeek(input.frequency);
  const billingMode = parseFitnessBillingMode(input.billing);
  if (!sessionType || !audience || sessionsPerWeek == null || !billingMode) return undefined;

  const defaultGroupSize = site.fitnessTraining.booking.groupTraining.minSize;
  const groupSize =
    trainingFormat === "group"
      ? (parseFitnessGroupSize(input.group) ?? defaultGroupSize)
      : defaultGroupSize;

  return {
    sessionType,
    trainingFormat,
    groupSize,
    audience,
    sessionsPerWeek,
    billingMode,
  };
}

export function appendFitnessBookingOptions(
  params: URLSearchParams,
  options: FitnessBookingOptions,
): URLSearchParams {
  params.set("session", options.sessionType);
  params.set("format", options.trainingFormat);
  if (options.trainingFormat === "group") {
    params.set("group", String(options.groupSize));
  }
  params.set("audience", options.audience);
  params.set("frequency", String(options.sessionsPerWeek));
  params.set("billing", options.billingMode);
  return params;
}

export function serializeFitnessBookingOptions(options: FitnessBookingOptions): URLSearchParams {
  return appendFitnessBookingOptions(new URLSearchParams(), options);
}

export function getFitnessSessionTypeLabel(slug: FitnessSessionType): string {
  return getFitnessSessionTypes().find((item) => item.slug === slug)?.label ?? slug;
}

export function getFitnessTrainingFormatLabel(slug: FitnessTrainingFormat): string {
  return getFitnessTrainingFormats().find((item) => item.slug === slug)?.label ?? slug;
}

export function getFitnessAudienceLabel(slug: FitnessAudience): string {
  return getFitnessAudienceTypes().find((item) => item.slug === slug)?.label ?? slug;
}

export function getFitnessBillingModeLabel(slug: FitnessBillingMode): string {
  return getFitnessBillingModes().find((item) => item.slug === slug)?.label ?? slug;
}

export function isFitnessGroupTraining(options: FitnessBookingOptions): boolean {
  return options.trainingFormat === "group";
}

export function formatFitnessBookingSummary(options: FitnessBookingOptions): string {
  const session = getFitnessSessionTypeLabel(options.sessionType);
  const format = isFitnessGroupTraining(options)
    ? `Group (${options.groupSize} people @ $${getFitnessGroupPerPersonCents() / 100}/person)`
    : getFitnessTrainingFormatLabel(options.trainingFormat);
  const audience = getFitnessAudienceLabel(options.audience);
  const frequency =
    options.sessionsPerWeek === 1
      ? "1 session per week"
      : `${options.sessionsPerWeek} sessions per week`;
  const billing = getFitnessBillingModeLabel(options.billingMode);
  return `${session} · ${format} · ${audience} · ${frequency} · ${billing}`;
}

export function isFitnessRecurringBilling(options: FitnessBookingOptions): boolean {
  return options.billingMode === "recurring";
}

export function computeFitnessGroupSessionCents(groupSize: number): number {
  return getFitnessGroupPerPersonCents() * groupSize;
}

export function computeFitnessPerSessionCents(
  options: FitnessBookingOptions,
  slidingScaleAmountCents: number,
): number {
  if (isFitnessGroupTraining(options)) {
    return computeFitnessGroupSessionCents(options.groupSize);
  }
  return slidingScaleAmountCents;
}

export function computeFitnessWeeklyRecurringCents(
  perSessionCents: number,
  sessionsPerWeek: number,
): number {
  return perSessionCents * sessionsPerWeek;
}
