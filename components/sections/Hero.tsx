import Link from "next/link";
import { site } from "@/content/site";
import { Container } from "@/components/layout/Container";

export function Hero() {
  return (
    <section className="border-b border-stone-200 bg-gradient-to-b from-stone-50 to-amber-50/40" aria-labelledby="home-hero-heading">
      <Container className="py-16 sm:py-24">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-800">
          {site.home.heroEyebrow}
        </p>
        <h1 id="home-hero-heading" className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
          {site.home.heroTitle}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-stone-700">{site.home.heroLead}</p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href="/contact"
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-stone-950 px-5 text-sm font-semibold text-amber-50 outline-none transition hover:bg-stone-800 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-amber-50 motion-reduce:transition-none"
          >
            Get in touch
          </Link>
          <Link
            href="/services"
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-stone-400 bg-white/80 px-5 text-sm font-semibold text-stone-900 outline-none transition hover:border-stone-900 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-amber-50 motion-reduce:transition-none"
          >
            View services
          </Link>
        </div>
      </Container>
    </section>
  );
}
