import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { WellnessGuideFinder } from "@/components/wellness-guide/WellnessGuideFinder";
import { healingServiceHref, site } from "@/content/site";

export const metadata: Metadata = {
  title: site.healingServices.title,
  description: site.healingServices.intro,
};

export default function HealingServicesPage() {
  const p = site.healingServices;
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
                      ? ", register then make a donation"
                      : ", choose a practitioner, register, pay, then schedule";

              return (
                <li key={service.slug}>
                  <Link
                    href={href}
                    className="card block min-h-11 p-5 font-medium text-[var(--foreground)] outline-none transition hover:border-[var(--rasta-green)] hover:text-[var(--rasta-green)] motion-reduce:transition-none"
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
        </Container>
      </div>
    </>
  );
}
