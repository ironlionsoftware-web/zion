import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: site.reiki.title,
  description: site.reiki.sections[0]?.paragraphs[0],
};

export default function ReikiPage() {
  return (
    <>
      <PageHeader title={site.reiki.title} centered />
      <div className="section-pad pt-0">
        <Container className="max-w-3xl">
          <div className="space-y-12">
            {site.reiki.sections.map((block, i) => (
              <section key={i} aria-labelledby={block.heading ? `reiki-h2-${i}` : undefined}>
                {block.heading ? (
                  <h2 id={`reiki-h2-${i}`} className="font-display text-2xl font-medium text-[var(--foreground)]">
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
