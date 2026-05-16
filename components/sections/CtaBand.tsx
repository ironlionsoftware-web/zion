import Link from "next/link";
import { site } from "@/content/site";
import { Container } from "@/components/layout/Container";

export function CtaBand() {
  return (
    <section className="py-16 sm:py-20" aria-labelledby="home-cta-heading">
      <Container>
        <div className="rounded-2xl bg-stone-950 px-6 py-10 text-stone-100 sm:px-10 sm:py-12">
          <h2 id="home-cta-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {site.home.ctaTitle}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-stone-300 sm:text-base">{site.home.ctaBody}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/contact"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-amber-400 px-5 text-sm font-semibold text-stone-950 outline-none transition hover:bg-amber-300 focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950 motion-reduce:transition-none"
            >
              Contact
            </Link>
            <span
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-stone-600 px-5 text-sm font-medium text-stone-300"
              title="Coming in a later phase"
            >
              Shop — coming soon
            </span>
            <span
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-stone-600 px-5 text-sm font-medium text-stone-300"
              title="Coming in a later phase"
            >
              Book online — coming soon
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}
