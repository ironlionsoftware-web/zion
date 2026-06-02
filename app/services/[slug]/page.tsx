import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { getService, getServiceSlugs, site } from "@/content/site";
import { registerHref } from "@/lib/registration/redirect";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getServiceSlugs();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return { title: "Service" };
  return {
    title: service.title,
    description: service.summary,
    openGraph: {
      title: `${service.title} · ${site.shortName}`,
      description: service.summary,
      url: `${site.url}/services/${service.slug}`,
    },
  };
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  return (
    <>
      <PageHeader title={service.title} lead={service.summary} centered>
        <p className="mt-6 text-sm text-muted">
          <Link href="/services" className="link-accent hover:underline">
            ← All services
          </Link>
        </p>
      </PageHeader>
      <div className="section-pad pt-0">
        <Container className="max-w-3xl">
          <div className="space-y-12">
            {service.sections.map((block, i) => (
              <section key={i} aria-label={block.heading ?? `Section ${i + 1}`}>
                {block.heading ? (
                  <h2 className="font-display text-2xl font-medium text-[var(--foreground)]">{block.heading}</h2>
                ) : null}
                <div className={block.heading ? "prose-content mt-4 space-y-4" : "prose-content space-y-4"}>
                  {block.paragraphs.map((para, j) => (
                    <p key={j}>{para}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
          <p className="mt-14 text-center">
            <Link href={registerHref("book", { serviceSlug: slug })} className="btn btn-primary">
              Register to book this service
            </Link>
          </p>
        </Container>
      </div>
    </>
  );
}
