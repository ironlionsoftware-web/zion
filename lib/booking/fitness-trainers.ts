import { getPractitioner, getPractitionerCalendlyUrl } from "@/lib/booking/practitioners";
import type { Practitioner } from "@/lib/booking/practitioners";
import { site } from "@/content/site";

export const FITNESS_TRAINING_SERVICE_SLUG = "fitness-training" as const;

export type FitnessOnlyTrainer = (typeof site.fitnessTraining.booking.fitnessOnlyTrainers)[number];
export type FitnessTrainer = Practitioner | FitnessOnlyTrainer;

export function getFitnessOnlyTrainers(): readonly FitnessOnlyTrainer[] {
  return site.fitnessTraining.booking.fitnessOnlyTrainers;
}

export function isFitnessOnlyPractitionerSlug(slug: string | undefined): boolean {
  const normalized = slug?.trim().toLowerCase() ?? "";
  return getFitnessOnlyTrainers().some((t) => t.slug === normalized);
}

export function getFitnessTrainerSlugs(): readonly string[] {
  return site.fitnessTraining.booking.trainerSlugs;
}

export function getFitnessTrainers(): FitnessTrainer[] {
  return getFitnessTrainerSlugs()
    .map((slug) => getPractitioner(slug))
    .filter((p): p is FitnessTrainer => p != null && !("priceMultiplier" in p));
}

export function getFitnessTrainerCalendlyUrl(slug: string): string {
  const trainer = getPractitioner(slug);
  if (!trainer || "priceMultiplier" in trainer) return site.calendly.url.trim();
  return getPractitionerCalendlyUrl(trainer);
}

export function isFitnessTrainingService(serviceSlug: string | undefined): boolean {
  return serviceSlug?.trim() === FITNESS_TRAINING_SERVICE_SLUG;
}

export function shouldIncludeFitnessOnlyPractitioner(serviceSlug: string | undefined): boolean {
  return !serviceSlug?.trim() || isFitnessTrainingService(serviceSlug);
}
