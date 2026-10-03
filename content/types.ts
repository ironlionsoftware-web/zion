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

/**
 * A real client review, quoted verbatim.
 *
 * Only ever paste what someone actually wrote — usually copied across from the
 * business's Google Business Profile. Never compose one. Prefer reviews that
 * describe how a session felt or what the person expected: a review crediting a
 * session with resolving a medical condition carries the same compliance risk
 * as making that claim directly, so leave those off the site.
 */
export type Testimonial = {
  /** Verbatim text. Trim for length only — never reword. */
  quote: string;
  /** First name, optionally with a city. Never a full name. */
  attribution: string;
  /** Where it was left, e.g. "Google review". Shown as provenance. */
  source?: string;
  /** Which offer this review speaks to, so each page shows relevant ones. */
  audience: TestimonialAudience | "both";
  /** Roughly when it was left, e.g. "2025". Display only. */
  date?: string;
};

/** The two things this business sells sessions of. "both" reviews show on either page. */
export type TestimonialAudience = "healing" | "fitness";

/**
 * The headline rating, shown near the top of a page so it registers before
 * anyone scrolls.
 *
 * Deliberately carries no review count: a count has to be re-checked and
 * re-entered every time the public profile changes, and a stale one is a false
 * claim. The average moves far more slowly.
 */
export type ReviewSummary = {
  /** e.g. "5.0" — as displayed on the platform. */
  rating: string;
  /** Where they live, e.g. "Google". */
  platform: string;
  /** Optional link to the public profile so visitors can check for themselves. */
  url?: string;
};

/**
 * A single-offer page for paid traffic to land on.
 *
 * These exist because an ad click needs one offer and one action: the homepage
 * asks a stranger to choose between healing, fitness, retreats and the shop,
 * and a paid visitor given four choices usually takes none. Routed under
 * `/offer/<slug>` and kept out of search (see the route files) so they don't
 * compete with the real service pages for the same keywords.
 */
export type LandingOffer = {
  /** Route segment under /offer — must match the directory name. */
  slug: string;
  /** Which reviews this page shows. */
  testimonialAudience: TestimonialAudience;
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  headline: string;
  lead: string;
  photo: NaturePhoto;
  /** The first-timer's real question, answered as an ordered sequence. */
  whatHappens: { heading: string; steps: readonly string[] };
  /** Plain-language price line, e.g. "Sessions are $120." */
  priceLine: string;
  priceNote?: string;
  /** Where the one button goes. Usually a registerHref() booking path. */
  primaryCta: { label: string; href: string };
  /** Short reassurances answering "is this for someone like me?" */
  reassurances: readonly string[];
  /** Shown small at the foot of the page. Keep it compliant. */
  disclaimer: string;
};

