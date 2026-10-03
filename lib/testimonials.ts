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
 * A balanced handful for the homepage, where the visitor has not yet said
 * whether they came for healing or for training.
 *
 * Takes them round-robin across the audiences rather than straight off the top,
 * so the homepage never shows three reviews about basketball coaching to someone
 * who arrived looking for Reiki.
 */
export function featuredTestimonials(
  all: readonly Testimonial[],
  limit = 3,
): readonly Testimonial[] {
  const byAudience: Record<string, Testimonial[]> = { healing: [], fitness: [], both: [] };
  for (const t of all) byAudience[t.audience]?.push(t);

  const picked: Testimonial[] = [];
  const order = ["healing", "fitness", "both"] as const;
  for (let round = 0; picked.length < limit; round++) {
    const before = picked.length;
    for (const key of order) {
      const next = byAudience[key][round];
      if (next && picked.length < limit) picked.push(next);
    }
    if (picked.length === before) break; // every audience exhausted
  }
  return picked;
}
