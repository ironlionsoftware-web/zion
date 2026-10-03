import type { Metadata } from "next";
import { OfferLanding } from "@/components/landing/OfferLanding";
import { site } from "@/content/site";

const offer = site.landing.healing;

export const metadata: Metadata = {
  title: offer.metaTitle,
  description: offer.metaDescription,
  /**
   * Paid landing pages stay out of search. Left indexable they would compete
   * with /healing-services and /services/* for the same keywords and split the
   * organic ranking between near-duplicate pages. `follow: true` so the links
   * out of here still carry weight. Deliberately not added to robots.ts
   * `disallow` either — a blocked crawl can never read this noindex.
   */
  robots: { index: false, follow: true },
};

export default function HealingOfferPage() {
  return <OfferLanding offer={offer} testimonials={site.testimonials} />;
}
