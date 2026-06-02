import Link from "next/link";
import { Container } from "@/components/layout/Container";

export function WellnessGuideTeaser() {
  return (
    <section className="section-pad bg-surface-muted" aria-labelledby="guide-teaser-title">
      <Container className="max-w-3xl text-center">
        <p className="eyebrow">Not sure where to start?</p>
        <h2 id="guide-teaser-title" className="section-title mt-2">
          Find your path
        </h2>
        <p className="prose-content mx-auto mt-4 max-w-2xl">
          Type what you want to heal or shift. We will recommend the best fit session, ceremony, fitness coaching, or
          plant medicine from our catalog.
        </p>
        <Link href="/find-your-path" className="btn btn-primary mt-8">
          Open wellness guide
        </Link>
      </Container>
    </section>
  );
}
