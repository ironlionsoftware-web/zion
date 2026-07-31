"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { site } from "@/content/site";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to the console (and, in production, Vercel's function logs) so the digest below can be
    // matched back to what actually happened. Never render error.message to visitors — see note
    // in the Next docs: server-side errors are already scrubbed of detail before reaching here,
    // but we don't want to take that for granted.
    console.error(error);
  }, [error]);

  return (
    <div className="section-pad">
      <Container className="max-w-xl text-center">
        <p className="eyebrow">Something went wrong</p>
        <h1 className="page-title mt-4">This one&rsquo;s on us</h1>
        <p className="prose-content mx-auto mt-5">
          The page ran into a problem loading. Nothing you did caused this. Please try again, or head back home. If
          you were in the middle of booking or checking out, email us at{" "}
          <a href={`mailto:${site.contact.email}`} className="link-accent font-medium hover:underline">
            {site.contact.email}
          </a>{" "}
          and we will help you pick up where you left off.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button type="button" onClick={() => reset()} className="btn btn-primary">
            Try again
          </button>
          <Link href="/" className="btn btn-secondary">
            Back to home
          </Link>
        </div>
        {error.digest ? <p className="mt-8 text-xs text-muted">Error reference: {error.digest}</p> : null}
      </Container>
    </div>
  );
}
