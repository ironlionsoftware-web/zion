import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { classServiceSlug, getClassCatalog } from "@/lib/booking/classes";
import { formatUsd } from "@/lib/cart/products";
import { site } from "@/content/site";

const catalog = getClassCatalog();

export const metadata: Metadata = {
  title: catalog.pageTitle,
  description: catalog.pageLead,
};

export default function HealingServicesClassesPage() {
  const classes = [...catalog.classes];

  return (
    <>
      <PageHeader title={catalog.pageTitle} lead={catalog.pageLead} centered />
      <div className="section-pad pt-0">
        <Container className="max-w-3xl">
          {classes.length === 0 ? (
            <p className="card prose-content p-6 text-sm text-muted">{catalog.emptyMessage}</p>
          ) : (
            <ul className="grid gap-6">
              {classes.map((item) => {
                const registerHref = `/register?next=book&service=${encodeURIComponent(classServiceSlug(item.slug))}`;

                return (
                  <li key={item.slug}>
                    <article className="card flex h-full flex-col p-6 sm:p-8">
                      <h2 className="font-display text-2xl font-medium text-[var(--foreground)]">{item.title}</h2>
                      <p className="prose-content mt-3 text-sm">{item.summary}</p>
                      <dl className="mt-5 space-y-2 text-sm text-muted">
                        <div>
                          <dt className="sr-only">Schedule</dt>
                          <dd>
                            <span className="font-medium text-[var(--foreground)]">When:</span> {item.schedule}
                          </dd>
                        </div>
                        <div>
                          <dt className="sr-only">Format</dt>
                          <dd>
                            <span className="font-medium text-[var(--foreground)]">Format:</span> {item.format}
                          </dd>
                        </div>
                        <div>
                          <dt className="sr-only">Location</dt>
                          <dd>
                            <span className="font-medium text-[var(--foreground)]">Where:</span> {item.location}
                          </dd>
                        </div>
                        {item.spotsRemaining !== undefined ? (
                          <div>
                            <dt className="sr-only">Availability</dt>
                            <dd>
                              <span className="font-medium text-[var(--foreground)]">Spots:</span>{" "}
                              {item.spotsRemaining} remaining
                            </dd>
                          </div>
                        ) : null}
                      </dl>
                      <p className="mt-5 text-lg font-medium text-[var(--rasta-green)]">
                        {formatUsd(item.priceCents)}
                        <span className="ml-2 text-xs font-normal text-muted">per person · excl. tax</span>
                      </p>
                      <Link href={registerHref} className="btn btn-primary mt-6 w-full sm:w-auto">
                        Register for this class
                      </Link>
                    </article>
                  </li>
                );
              })}
            </ul>
          )}

          <p className="prose-content mt-10 text-sm">
            <Link href="/healing-services" className="link-accent font-medium hover:underline">
              ← Back to {site.healingServices.title}
            </Link>
          </p>
        </Container>
      </div>
    </>
  );
}
