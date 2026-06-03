import type { ClassOffering } from "@/content/site";
import { site } from "@/content/site";

export type { ClassOffering };

const CLASS_PREFIX = "class-";

export function classServiceSlug(classSlug: string): string {
  return `${CLASS_PREFIX}${classSlug}`;
}

export function parseClassServiceSlug(serviceSlug: string | undefined): string | undefined {
  if (!serviceSlug?.startsWith(CLASS_PREFIX)) return undefined;
  const classSlug = serviceSlug.slice(CLASS_PREFIX.length);
  return classSlug.length > 0 ? classSlug : undefined;
}

export function isClassService(serviceSlug: string | undefined): boolean {
  return parseClassServiceSlug(serviceSlug) !== undefined;
}

export function getClassOffering(classSlug: string): ClassOffering | undefined {
  return site.healingServices.classCatalog.classes.find((c) => c.slug === classSlug);
}

export function getClassOfferingFromServiceSlug(serviceSlug: string): ClassOffering | undefined {
  const classSlug = parseClassServiceSlug(serviceSlug);
  return classSlug ? getClassOffering(classSlug) : undefined;
}

export function getClassCatalog() {
  return site.healingServices.classCatalog;
}
