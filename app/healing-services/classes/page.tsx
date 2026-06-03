import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { getClassCatalog } from "@/lib/booking/classes";
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
            <div className="card mx-auto max-w-xl px-8 py-14 text-center">
              <p className="font-display text-2xl font-medium text-[var(--foreground)]">{catalog.emptyMessage}</p>
              <p className="prose-content mt-4 text-sm">
                We are putting together our first workshops. Check back here or{" "}
                <Link href="/contact" className="link-accent font-medium hover:underline">
                  contact us
                </Link>{" "}
                if you would like to hear when registration opens.
              </p>
            </div>
          ) : (
            <ul className="grid gap-6">
              {classes.map((item) => (
                <li key={item.slug}>
                  <article className="card flex h-full flex-col p-6 sm:p-8">
                    <h2 className="font-display text-2xl font-medium text-[var(--foreground)]">{item.title}</h2>
                    <p className="prose-content mt-3 text-sm">{item.summary}</p>
                  </article>
                </li>
              ))}
            </ul>
          )}

          <p className="prose-content mt-10 text-center text-sm">
            <Link href="/healing-services" className="link-accent font-medium hover:underline">
              ← Back to {site.healingServices.title}
            </Link>
          </p>
        </Container>
      </div>
    </>
  );
}
