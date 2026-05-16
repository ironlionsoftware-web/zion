import Link from "next/link";
import { services } from "@/content/site";
import { Container } from "@/components/layout/Container";

export function ServiceGrid() {
  return (
    <section className="border-y border-stone-200 bg-white py-16 sm:py-20" aria-labelledby="home-services-heading">
      <Container>
        <h2 id="home-services-heading" className="text-2xl font-semibold tracking-tight text-stone-950 sm:text-3xl">
          Ways we work together
        </h2>
        <p className="mt-3 max-w-2xl text-stone-600">
          Tap a service to read more. Copy here is starter text—swap in your voice and specifics anytime.
        </p>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <li key={s.slug}>
              <article className="flex h-full flex-col rounded-lg border border-stone-200 bg-stone-50/60 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-stone-950">{s.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-600">{s.summary}</p>
                <Link
                  href={`/services/${s.slug}`}
                  className="mt-6 inline-flex min-h-11 items-center text-sm font-semibold text-amber-900 underline-offset-4 outline-none hover:underline focus-visible:rounded focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-50"
                >
                  Read more
                </Link>
              </article>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
