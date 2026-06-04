import { getPractitioner, getPractitionerCalendlyUrl } from "@/lib/booking/practitioners";
import type { Practitioner } from "@/lib/booking/practitioners";
import { site } from "@/content/site";

export function getFitnessTrainerSlugs(): readonly string[] {
  return site.fitnessTraining.booking.trainerSlugs;
}

export function getFitnessTrainers(): Practitioner[] {
  return getFitnessTrainerSlugs()
    .map((slug) => getPractitioner(slug))
    .filter((p): p is Practitioner => p != null && !("priceMultiplier" in p));
}

export function getFitnessTrainerCalendlyUrl(slug: string): string {
  const trainer = getPractitioner(slug);
  if (!trainer || "priceMultiplier" in trainer) return site.calendly.url.trim();
  return getPractitionerCalendlyUrl(trainer);
}
