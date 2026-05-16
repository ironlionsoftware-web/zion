import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { services, site } from "@/content/site";

export const metadata: Metadata = {
  title: site.servicesIntro.title,
  description: site.servicesIntro.lead,
};

export default function ServicesPage() {
  return (
    <div className="py-14 sm:py-20">
      <Container>
        <h1 className="text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">{site.servicesIntro.title}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-stone-700">{site.servicesIntro.lead}</p>
        <ul className="mt-12 space-y-6">
          {services.map((s) => (
            <li key={s.slug}>
              <article className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-xl font-semibold text-stone-950">{s.title}</h2>
                <p className="mt-2 text-stone-600">{s.summary}</p>
                <Link
                  href={`/services/${s.slug}`}
                  className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-amber-900 underline-offset-4 outline-none hover:underline focus-visible:rounded focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  Full page
                </Link>
              </article>
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
}
