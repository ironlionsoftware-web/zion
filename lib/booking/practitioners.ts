import { site } from "@/content/site";

export const DUAL_PRACTITIONER_SLUG = "dual";

export type Practitioner = (typeof site.practitioners.list)[number];

export type PractitionerSelection = Practitioner | (typeof site.practitioners.dualSession);

const CALENDLY_ENV_KEYS: Record<string, string> = {
  "johari-templin-jr": "CALENDLY_URL_JOHARI_TEMPLIN_JR",
  "johnny-lona": "CALENDLY_URL_JOHNNY_LONA",
  [DUAL_PRACTITIONER_SLUG]: "CALENDLY_URL_DUAL_SESSION",
};

export function isDualPractitionerSlug(slug: string | undefined): boolean {
  return slug?.trim().toLowerCase() === DUAL_PRACTITIONER_SLUG;
}

export function getDualSessionConfig() {
  return site.practitioners.dualSession;
}

export function getPractitionerCalendlyUrl(practitioner: PractitionerSelection): string {
  const envKey = CALENDLY_ENV_KEYS[practitioner.slug];
  const fromEnv = envKey ? process.env[envKey]?.trim() : "";
  if (fromEnv) return fromEnv;
  return practitioner.calendlyUrl.trim() || site.calendly.url.trim();
}

export function getPractitioners(): readonly Practitioner[] {
  return site.practitioners.list;
}

export function getPractitioner(slug: string): PractitionerSelection | undefined {
  const normalized = slug.trim().toLowerCase();
  if (normalized === DUAL_PRACTITIONER_SLUG) {
    return site.practitioners.dualSession;
  }
  return site.practitioners.list.find((p) => p.slug === normalized);
}

export function parsePractitionerSlug(value: string | null | undefined): string | undefined {
  const slug = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (slug === DUAL_PRACTITIONER_SLUG) return slug;
  return getPractitioner(slug) ? slug : undefined;
}

export function getPractitionerDisplayName(slug: string): string {
  const p = getPractitioner(slug);
  if (!p) return slug;
  return p.name;
}

export function computeServiceCheckoutCents(basePriceCents: number, practitionerSlug: string): number {
  if (!isDualPractitionerSlug(practitionerSlug)) return basePriceCents;
  const multiplier = site.practitioners.dualSession.priceMultiplier;
  return Math.round(basePriceCents * multiplier);
}
