import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { NatureFeature } from "@/components/sections/NatureFeature";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: site.fitnessTraining.title,
  description: site.fitnessTraining.sections[0]?.paragraphs[0],
};

export default function FitnessTrainingPage() {
  const p = site.fitnessTraining;
  return (
    <>
      <PageHeader title={p.title} centered />
      <div className="section-pad pt-0">
        <Container className="max-w-5xl">
          <div className="mb-12 grid gap-4 sm:grid-cols-2">
            <NatureFeature photo={p.dominicaPhoto} label={p.dominicaCaption} />
            <NatureFeature photo={p.austinPhoto} label={p.austinCaption} />
          </div>
          <div className="mx-auto max-w-3xl space-y-12">
            {p.sections.map((block, i) => (
              <section
                key={i}
                aria-labelledby={"heading" in block && block.heading ? `ft-h2-${i}` : undefined}
              >
                {"heading" in block && block.heading ? (
                  <h2 id={`ft-h2-${i}`} className="font-display text-2xl font-medium text-[var(--foreground)]">
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
