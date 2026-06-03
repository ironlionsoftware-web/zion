import Link from "next/link";
import { services } from "@/content/site";
import { Container } from "@/components/layout/Container";

export function ServiceGrid() {
  return (
    <section className="section-pad border-t border-subtle bg-surface" aria-labelledby="home-services-heading">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="home-services-heading" className="section-title">
            Ways we work together
          </h2>
          <p className="prose-content mt-4">
            Tap a service to read more. Copy here is starter text you can swap with your voice and specifics anytime.
          </p>
        </div>
        <ul className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <li key={s.slug}>
              <article className="card flex h-full flex-col p-6 transition hover:border-[var(--rasta-green)]/30 sm:p-8 motion-reduce:transition-none">
                <h3 className="font-display text-xl font-medium text-[var(--foreground)]">{s.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{s.summary}</p>
                <Link
                  href={`/services/${s.slug}`}
                  className="link-accent mt-6 inline-flex min-h-11 w-full items-center py-2 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-[var(--rasta-gold)] focus-visible:ring-offset-2"
                >
                  <span className="sr-only">Learn more about </span>
                  {s.title}
                  <span aria-hidden="true"> →</span>
                </Link>
              </article>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
