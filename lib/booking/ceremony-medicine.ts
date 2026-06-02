import { site } from "@/content/site";

export type CeremonyMedicineOption = (typeof site.healingServices.plantMedicineCeremony.options)[number];

export const PLANT_MEDICINE_CEREMONY_SLUG = site.healingServices.plantMedicineCeremony.serviceSlug;

export function isPlantMedicineCeremonyService(serviceSlug: string | undefined): boolean {
  return serviceSlug?.trim() === PLANT_MEDICINE_CEREMONY_SLUG;
}

export function getCeremonyMedicineOptions(): readonly CeremonyMedicineOption[] {
  return site.healingServices.plantMedicineCeremony.options;
}

export function getCeremonyMedicine(slug: string): CeremonyMedicineOption | undefined {
  const normalized = slug.trim().toLowerCase();
  return site.healingServices.plantMedicineCeremony.options.find((option) => option.slug === normalized);
}

export function parseCeremonyMedicineSlug(value: string | null | undefined): string | undefined {
  const slug = typeof value === "string" ? value.trim().toLowerCase() : "";
  return getCeremonyMedicine(slug) ? slug : undefined;
}
