/**
 * Shared content types for the platform.
 *
 * These describe the SHAPE of a tenant's business content. The values live in
 * `tenants/<slug>/content.ts` — one directory per practitioner who licenses
 * this platform. Nothing in this file is specific to any one business.
 */

export type NavItem = {
  href: string;
  label: string;
};

export type Service = {
  slug: string;
  title: string;
  summary: string;
  sections: { heading?: string; paragraphs: string[] }[];
};

export type ShopProductVariant = {
  id: string;
  label: string;
  priceCents: number;
};

export type ShopProductOptionChoice = {
  id: string;
  label: string;
  /** Short wellness-oriented description for shop display */
  description?: string;
};

export type ShopProductOptionGroup = {
  id: string;
  label: string;
  choices: ShopProductOptionChoice[];
};

export type ShopProduct = {
  slug: string;
  name: string;
  description?: string;
  priceCents?: number;
  variants?: ShopProductVariant[];
  /** Multi-option products (e.g. size + flavor). Price keyed by choice ids joined with "|". */
  optionGroups?: ShopProductOptionGroup[];
  optionPrices?: Record<string, number>;
  imageSrc: string;
  imageAlt: string;
};

export type HealingServiceItem = {
  slug: string;
  label: string;
  /** book → pay then schedule; shop → apothecary; donation → pay-what-you-can; classes → class catalog */
  kind: "book" | "shop" | "donation" | "classes";
  /** Fixed price for bookable services (card checkout before scheduling) */
  priceCents?: number;
  /** Pay-what-you-can range for bookable services (e.g. card readings) */
  slidingScale?: SlidingScale;
};

export type SlidingScale = {
  minCents: number;
  maxCents: number;
  defaultCents: number;
};

export type BookableService = HealingServiceItem & {
  priceCents: number;
  slidingScale?: SlidingScale;
};

export type ClassOffering = {
  slug: string;
  title: string;
  summary: string;
  schedule: string;
  format: string;
  location: string;
  priceCents: number;
  spotsRemaining?: number;
};

export type NaturePhoto = {
  src: string;
  alt: string;
};

