import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { NatureFeature } from "@/components/sections/NatureFeature";
import { ReviewRating } from "@/components/testimonials/ReviewRating";
import { Testimonials } from "@/components/testimonials/Testimonials";
import { site } from "@/content/site";
import type { LandingOffer, Testimonial } from "@/content/types";
import { selectTestimonials } from "@/lib/testimonials";

type OfferLandingProps = {
  offer: LandingOffer;
  testimonials: readonly Testimonial[];
};

/**
 * One offer, one action — the page an ad click lands on.
 *
 * Deliberately has no links out except the single call to action, so a visitor
 * who arrived from one specific ad is never asked to choose between the shop,
 * the retreats and four services. The header and footer stay: a stranger
 * deciding whether to lie down in a room with you needs to see a real business
 * around the offer.
 */
export function OfferLanding({ offer, testimonials }: OfferLandingProps) {
  // Every review that speaks to this offer. The cap that used to be here existed
  // to stop the call to action being buried; long reviews now collapse to two
  // lines, so the whole set costs little height and is worth more as proof.
  const reviews = selectTestimonials(testimonials, offer.testimonialAudience);

  const cta = (
    <Link href={offer.primaryCta.href} className="btn btn-primary w-full sm:w-auto">
      {offer.primaryCta.label}
    </Link>
  );

  return (
    <>
      <header className="border-b border-subtle bg-surface/80 py-10 sm:py-16">
        <Container className="max-w-3xl">
          <p className="eyebrow">{offer.eyebrow}</p>
          <h1 className="page-title mt-4">{offer.headline}</h1>
          <div className="symbol-band mt-6 h-px w-16 opacity-80" aria-hidden="true" />
          {testimonials.length > 0 ? (
            <ReviewRating summary={site.reviewSummary} className="mt-6" />
          ) : null}
          <p className="prose-content mt-6 max-w-2xl">{offer.lead}</p>
          <div className="mt-8 flex w-full max-w-md flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:items-center">
            {cta}
            <p className="text-muted text-sm sm:self-center">{offer.priceLine}</p>
          </div>
        </Container>
      </header>

      <div className="section-pad">
        <Container className="max-w-3xl">
          <div className="space-y-14">
            <NatureFeature photo={offer.photo} />

            <section aria-labelledby="offer-what-happens">
              <h2 id="offer-what-happens" className="section-title">
                {offer.whatHappens.heading}
              </h2>
              <ol className="mt-6 space-y-5">
                {offer.whatHappens.steps.map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <span
                      className="font-display text-xl font-medium text-earth tabular-nums"
                      aria-hidden="true"
                    >
                      {i + 1}
                    </span>
                    <p className="prose-content flex-1">{step}</p>
                  </li>
                ))}
              </ol>
            </section>

            <section aria-labelledby="offer-reassurances">
              <h2 id="offer-reassurances" className="section-title">
                Who this is for
              </h2>
              <ul className="mt-6 space-y-3">
                {offer.reassurances.map((line, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="text-earth" aria-hidden="true">
                      &middot;
                    </span>
                    <span className="prose-content flex-1">{line}</span>
                  </li>
                ))}
              </ul>
            </section>

            <Testimonials testimonials={reviews} headingId="offer-testimonials" />

            <section
              aria-labelledby="offer-book"
              className="border border-subtle bg-surface/90 px-5 py-10 text-center sm:px-12 sm:py-14"
            >
              <h2 id="offer-book" className="section-title">
                {offer.primaryCta.label}
              </h2>
              <p className="prose-content mx-auto mt-5 max-w-xl">{offer.priceLine}</p>
              {offer.priceNote ? (
                <p className="text-muted mx-auto mt-3 max-w-xl text-sm">{offer.priceNote}</p>
              ) : null}
              <div className="mt-8 flex w-full max-w-md flex-col items-stretch gap-3 sm:mx-auto sm:max-w-none sm:flex-row sm:justify-center">
                {cta}
              </div>
            </section>

            <p className="text-muted text-center text-xs">{offer.disclaimer}</p>
          </div>
        </Container>
      </div>
    </>
  );
}
