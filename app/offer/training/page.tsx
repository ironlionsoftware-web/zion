import type { Metadata } from "next";
import { OfferLanding } from "@/components/landing/OfferLanding";
import { site } from "@/content/site";

const offer = site.landing.training;

export const metadata: Metadata = {
  title: offer.metaTitle,
  description: offer.metaDescription,
  /** Out of search for the same reason as /offer/healing — see that file. */
  robots: { index: false, follow: true },
};

export default function TrainingOfferPage() {
  return <OfferLanding offer={offer} testimonials={site.testimonials} />;
}
