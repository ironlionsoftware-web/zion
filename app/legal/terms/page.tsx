import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Terms of use",
  robots: { index: false, follow: false },
};

export default function TermsPage() {
  return (
    <div className="py-14 sm:py-20">
      <Container className="max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">Terms of use (draft)</h1>
        <p className="mt-2 text-sm font-medium text-amber-900">Placeholder — not legal advice. Review with counsel before publishing.</p>
        <div className="mt-8 space-y-4 text-base leading-relaxed text-stone-700">
          <p>{site.legal.termsSummary}</p>
          <p>
            Future versions may cover liability limits, health disclaimers for fitness and energy work, refund policies for digital or
            in-person goods, and dispute resolution.
          </p>
        </div>
      </Container>
    </div>
  );
}
