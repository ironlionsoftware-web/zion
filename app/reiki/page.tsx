import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: site.reiki.title,
  description: site.reiki.sections[0]?.paragraphs[0],
};

export default function ReikiPage() {
  return (
    <div className="py-14 sm:py-20">
      <Container className="max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">{site.reiki.title}</h1>
        <div className="mt-10 space-y-10">
          {site.reiki.sections.map((block, i) => (
            <section key={i} aria-labelledby={block.heading ? `reiki-h2-${i}` : undefined}>
              {block.heading ? (
                <h2 id={`reiki-h2-${i}`} className="text-xl font-semibold text-stone-950">
                  {block.heading}
                </h2>
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
      </Container>
    </div>
  );
}
