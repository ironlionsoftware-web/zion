import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { Testimonials } from "@/components/testimonials/Testimonials";
import { WellnessGuideFinder } from "@/components/wellness-guide/WellnessGuideFinder";
import { healingServiceHref, site } from "@/content/site";
import { selectTestimonials } from "@/lib/testimonials";

export const metadata: Metadata = {
  title: site.healingServices.title,
  description: site.healingServices.intro,
};

export default function HealingServicesPage() {
  const p = site.healingServices;
  const reviews = selectTestimonials(site.testimonials, "healing");
  return (
    <>
      <PageHeader title={p.title} lead={p.intro} centered />
      <div className="section-pad pt-0">
        <Container className="max-w-3xl">
          <WellnessGuideFinder compact />
          <ul className="mt-12 grid gap-4 sm:grid-cols-2">
            {p.services.map((service) => {
              const href = healingServiceHref(service);
              const srSuffix =
                service.kind === "shop"
                  ? ", shop plant medicine"
                  : service.kind === "classes"
                    ? ", view available classes to register"
                    : service.kind === "donation"
                      ? ", register then choose your sliding scale amount"
                      : ", choose a practitioner, pick a time, register, then pay";

              return (
                <li key={service.slug}>
                  <Link
                    href={href}
                    className="card block min-h-[3.25rem] p-5 py-4 font-medium leading-snug text-[var(--foreground)] outline-none transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] active:bg-surface-muted motion-reduce:transition-none"
                  >
                    {service.label}
                    <span className="sr-only">{srSuffix}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-14 space-y-12">
            {p.sections.map((block, i) => (
              <section key={i} aria-labelledby={block.heading ? `hs-h2-${i}` : undefined}>
                {block.heading ? (
                  <h2 id={`hs-h2-${i}`} className="font-display text-2xl font-medium text-[var(--foreground)]">
                    {block.heading}
                  </h2>
                ) : null}
                <div className={block.heading ? "prose-content mt-4 space-y-4" : "prose-content space-y-4"}>
                  {block.paragraphs.map((para, j) => (
                    <p key={j}>{para}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
          <Testimonials testimonials={reviews} className="mt-14" headingId="hs-reviews" />
        </Container>
      </div>
    </>
  );
}
