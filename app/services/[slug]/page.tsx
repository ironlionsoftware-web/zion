import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { getService, getServiceSlugs, site } from "@/content/site";

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
    <div className="py-14 sm:py-20">
      <Container className="max-w-3xl">
        <p className="text-sm font-medium text-amber-900">
          <Link href="/services" className="underline-offset-4 outline-none hover:underline focus-visible:rounded focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-50">
            Services
          </Link>
          <span aria-hidden className="px-2 text-stone-400">
            /
          </span>
          <span className="text-stone-600">{service.title}</span>
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">{service.title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-stone-700">{service.summary}</p>
        <div className="mt-10 space-y-10">
          {service.sections.map((block, i) => (
            <section key={i} aria-label={block.heading ?? `Section ${i + 1}`}>
              {block.heading ? (
                <h2 className="text-xl font-semibold text-stone-950">{block.heading}</h2>
              ) : null}
              <div className={block.heading ? "mt-3 space-y-4" : "space-y-4"}>
                {block.paragraphs.map((para, j) => (
                  <p key={j} className="leading-relaxed text-stone-700">
                    {para}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
        <p className="mt-12">
          <Link
            href="/contact"
            className="inline-flex min-h-11 items-center rounded-md bg-stone-950 px-5 text-sm font-semibold text-amber-50 outline-none transition hover:bg-stone-800 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-50 motion-reduce:transition-none"
          >
            Ask about this service
          </Link>
        </p>
      </Container>
    </div>
  );
}
