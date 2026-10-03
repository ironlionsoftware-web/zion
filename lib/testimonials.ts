import type { Testimonial, TestimonialAudience } from "@/content/types";

/**
 * Pick the reviews worth showing on one page.
 *
 * The healing pages and the training pages draw different people, and a review
 * about basketball coaching does nothing for someone deciding whether to book a
 * Reiki session. Reviews marked `both` speak to either.
 *
 * Order is the order they are listed in the tenant content, so the strongest
 * review for each audience should be placed first there rather than sorted here.
 *
 * Defaults to every matching review. The paid landing pages pass a limit so the
 * call to action is not pushed below where anyone reads; the indexed service
 * pages take the lot, so every review is published somewhere.
 */
export function selectTestimonials(
  all: readonly Testimonial[],
  audience: TestimonialAudience,
  limit = Number.POSITIVE_INFINITY,
): readonly Testimonial[] {
  return all.filter((t) => t.audience === audience || t.audience === "both").slice(0, limit);
}

/**
 * The homepage reviews, hand-picked and in the order given.
 *
 * Which reviews lead the homepage is a judgement about the business, not about
 * code, so the choice lives in tenant content as a list of attributions and this
 * only resolves it. Names that match nothing are dropped rather than throwing —
 * a typo should not take the site down — so if a review goes missing from the
 * homepage, check the spelling in `site.home.featuredReviews` first.
 */
export function pickTestimonials(
  all: readonly Testimonial[],
  attributions: readonly string[],
): readonly Testimonial[] {
  return attributions
    .map((name) => all.find((t) => t.attribution.toLowerCase() === name.trim().toLowerCase()))
    .filter((t): t is Testimonial => Boolean(t));
}
