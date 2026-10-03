"use client";

import { useState } from "react";
import type { Testimonial } from "@/content/types";

/**
 * Roughly where a review stops fitting in two lines on a narrow screen. Reviews
 * under this render whole with no control, so a one-sentence review never gets a
 * pointless "Read full review" button under it.
 */
const COLLAPSE_OVER_CHARS = 200;

export function isLongTestimonial(quote: string): boolean {
  return quote.trim().length > COLLAPSE_OVER_CHARS;
}

/**
 * One review.
 *
 * Long ones collapse to two lines with a control to open them, because several
 * of these run to six paragraphs and a page of them buries everything beneath.
 * Collapsed state renders the whole quote as a single clamped block — CSS
 * line-clamp only applies to one block of text, so the reviewer's paragraph
 * breaks appear once it is open.
 */
export function TestimonialCard({ quote, attribution, source }: Testimonial) {
  const [open, setOpen] = useState(false);
  const expandable = isLongTestimonial(quote);

  const paragraphs = quote
    .split(/\n+/)
    .map((para) => para.trim())
    .filter(Boolean);
  const last = paragraphs.length - 1;
  const collapsed = expandable && !open;

  return (
    <figure className="card px-5 py-6 sm:px-7">
      {collapsed ? (
        <blockquote className="prose-content">
          <p className="line-clamp-2">&ldquo;{paragraphs.join(" ")}&rdquo;</p>
        </blockquote>
      ) : (
        <blockquote className="prose-content space-y-4">
          {paragraphs.map((para, i) => (
            <p key={i}>
              {i === 0 ? <>&ldquo;</> : null}
              {para}
              {i === last ? <>&rdquo;</> : null}
            </p>
          ))}
        </blockquote>
      )}

      {expandable ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="link-accent mt-3 text-sm font-medium"
        >
          {open ? "Show less" : "Read full review"}
        </button>
      ) : null}

      <figcaption className="text-muted mt-4 text-sm">
        {attribution}
        {source ? <span className="opacity-70"> &middot; {source}</span> : null}
      </figcaption>
    </figure>
  );
}
