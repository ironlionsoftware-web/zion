import type { Testimonial } from "@/content/types";

type TestimonialsProps = {
  testimonials: readonly Testimonial[];
  /** Heading text. Omit the heading entirely by passing null. */
  heading?: string | null;
  headingId?: string;
  /**
   * Shown once under the reviews. Defaults to a plain statement that these are
   * unedited client accounts rather than a promise of results — the reviews are
   * published verbatim by instruction, so that context belongs beside them.
   * Pass null to omit.
   */
  note?: string | null;
  className?: string;
};

const DEFAULT_NOTE =
  "Reviews are published as our clients wrote them, unedited. They describe individual experiences, not a promise of results, and nothing in them is medical advice.";

/**
 * Real client reviews, quoted verbatim.
 *
 * Renders nothing when the list is empty, so a tenant with no reviews yet simply
 * has no review section rather than an empty shell.
 *
 * Quotes keep the reviewer's own paragraph breaks: several of these run long, and
 * collapsing one into a single block would both misrepresent how it was written
 * and be unreadable.
 */
export function Testimonials({
  testimonials,
  heading = "What clients say",
  headingId = "testimonials-heading",
  note = DEFAULT_NOTE,
  className = "",
}: TestimonialsProps) {
  if (testimonials.length === 0) return null;

  return (
    <section aria-labelledby={heading ? headingId : undefined} className={className}>
      {heading ? (
        <h2 id={headingId} className="section-title">
          {heading}
        </h2>
      ) : null}
      <div className={heading ? "mt-6 space-y-5" : "space-y-5"}>
        {testimonials.map((t, i) => {
          const paragraphs = t.quote
            .split(/\n+/)
            .map((para) => para.trim())
            .filter(Boolean);
          const last = paragraphs.length - 1;

          return (
            <figure key={i} className="card px-5 py-6 sm:px-7">
              <blockquote className="prose-content space-y-4">
                {paragraphs.map((para, j) => (
                  <p key={j}>
                    {j === 0 ? <>&ldquo;</> : null}
                    {para}
                    {j === last ? <>&rdquo;</> : null}
                  </p>
                ))}
              </blockquote>
              <figcaption className="text-muted mt-4 text-sm">
                {t.attribution}
                {t.source ? <span className="opacity-70"> &middot; {t.source}</span> : null}
              </figcaption>
            </figure>
          );
        })}
      </div>
      {note ? <p className="text-muted mt-5 text-xs">{note}</p> : null}
    </section>
  );
}
