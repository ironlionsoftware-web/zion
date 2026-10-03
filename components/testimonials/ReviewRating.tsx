import type { ReviewSummary } from "@/content/types";

type ReviewRatingProps = {
  summary: ReviewSummary;
  className?: string;
};

/**
 * "★★★★★ 5.0 stars on Google reviews" — the one line that has to land before
 * anyone scrolls.
 *
 * Stars are drawn rather than loaded, and marked aria-hidden: the rating is
 * already stated in words, so repeating it as five star glyphs would only make
 * a screen reader noisier.
 */
export function ReviewRating({ summary, className = "" }: ReviewRatingProps) {
  const label = `${summary.rating} stars on ${summary.platform} reviews`;

  const body = (
    <>
      <span aria-hidden="true" className="text-earth tracking-[0.12em]">
        &#9733;&#9733;&#9733;&#9733;&#9733;
      </span>
      <span className="font-medium">{label}</span>
    </>
  );

  const shared = "inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-sm";

  if (summary.url) {
    return (
      <a
        href={summary.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`${shared} link-accent ${className}`}
      >
        {body}
      </a>
    );
  }

  return <p className={`${shared} text-[var(--foreground)] ${className}`}>{body}</p>;
}
