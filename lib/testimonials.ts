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
