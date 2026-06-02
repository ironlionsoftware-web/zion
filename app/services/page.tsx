import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { services, site } from "@/content/site";

export const metadata: Metadata = {
  title: site.servicesIntro.title,
  description: site.servicesIntro.lead,
};

export default function ServicesPage() {
  return (
    <>
      <PageHeader title={site.servicesIntro.title} lead={site.servicesIntro.lead} centered />
      <div className="section-pad pt-0">
        <Container>
          <ul className="mx-auto max-w-3xl space-y-6">
            {services.map((s) => (
              <li key={s.slug}>
                <article className="card p-8 sm:p-10">
                  <h2 className="font-display text-2xl font-medium text-[var(--foreground)]">{s.title}</h2>
                  <p className="prose-content mt-3 text-base">{s.summary}</p>
                  <Link href={`/services/${s.slug}`} className="link-accent mt-5 inline-flex min-h-11 items-center text-sm font-semibold">
                    Full page →
                  </Link>
                </article>
              </li>
            ))}
          </ul>

          <section className="card mx-auto mt-16 max-w-3xl p-8 sm:p-10" aria-labelledby="book-healing-heading">
            <h2 id="book-healing-heading" className="font-display text-2xl font-medium text-[var(--foreground)]">
              Book a healing session
            </h2>
            <p className="prose-content mt-4">
              Healing services use a pay first flow: register, complete payment, then schedule on Calendly with your
              practitioner.
            </p>
            <Link href="/healing-services" className="btn btn-primary mt-6 inline-flex">
              View Healing Services & Classes
            </Link>
          </section>
        </Container>
      </div>
    </>
  );
}
