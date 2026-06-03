import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { PhotoRoll } from "@/components/sections/PhotoRoll";
import { formatRetreatUsd } from "@/lib/retreat/booking";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: site.retreat.title,
  description: site.retreat.sections[0]?.paragraphs[0],
};

export default function RetreatPage() {
  const p = site.retreat;
  return (
    <>
      <PageHeader title={p.title} centered />
      <div className="section-pad pt-0">
        <Container className="max-w-3xl">
          <PhotoRoll photos={p.photos} title="Iron Lion Retreat photos" />
          <section className="mt-14" aria-labelledby="themed-retreats-heading">
            <h2 id="themed-retreats-heading" className="font-display text-2xl font-medium text-[var(--foreground)]">
              Themed retreats
            </h2>
            <p className="prose-content mt-4">{p.themedRetreatsIntro}</p>
            <div className="card mt-8 p-5 sm:p-6">
              <h3 className="font-display text-lg font-medium text-[var(--foreground)]">{p.allInclusive.heading}</h3>
              <div className="prose-content mt-3 space-y-3 text-sm">
                {p.allInclusive.paragraphs.map((para, j) => (
                  <p key={j}>{para}</p>
                ))}
              </div>
            </div>
            <ul className="mt-8 grid gap-4">
              {p.booking.types.map((type) => (
                <li key={type.slug} className="card p-5">
                  <h3 className="font-medium text-[var(--foreground)]">{type.label}</h3>
                  {type.summary ? <p className="mt-2 text-sm text-muted">{type.summary}</p> : null}
                  {"durationOptions" in type && type.durationOptions.length > 0 ? (
                    <ul className="mt-3 space-y-1 text-xs font-medium text-[var(--rasta-green)]">
                      {type.durationOptions.map((d) => (
                        <li key={d.slug}>
                          {d.label}: {formatRetreatUsd(d.totalCents)} all inclusive · $500 deposit
                        </li>
                      ))}
                    </ul>
                  ) : "totalCents" in type && typeof type.totalCents === "number" ? (
                    <p className="mt-2 text-xs font-medium text-[var(--rasta-green)]">
                      {"duration" in type && type.duration ? `${type.duration} · ` : ""}
                      {formatRetreatUsd(type.totalCents)} per person · $500 deposit
                    </p>
                  ) : "duration" in type && type.duration ? (
                    <p className="mt-2 text-xs font-medium text-[var(--rasta-green)]">{type.duration}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
          <p className="mt-10 text-center">
            <Link href="/retreat/book" className="btn btn-primary">
              {site.retreat.booking.title}
            </Link>
          </p>
          <div className="mt-14 space-y-12">
            {p.sections.map((block, i) => (
              <section key={i} aria-labelledby={"heading" in block && block.heading ? `rt-h2-${i}` : undefined}>
                {"heading" in block && block.heading ? (
                  <h2 id={`rt-h2-${i}`} className="font-display text-2xl font-medium text-[var(--foreground)]">
                    {block.heading}
                  </h2>
                ) : null}
                <div className={"heading" in block && block.heading ? "prose-content mt-4 space-y-4" : "prose-content space-y-4"}>
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
