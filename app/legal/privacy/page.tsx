import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  robots: { index: false, follow: false },
};

export default function PrivacyPage() {
  return (
    <div className="py-14 sm:py-20">
      <Container className="max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">Privacy policy (draft)</h1>
        <p className="mt-2 text-sm font-medium text-amber-900">Placeholder — not legal advice. Review with counsel before publishing.</p>
        <div className="mt-8 space-y-4 text-base leading-relaxed text-stone-700">
          <p>{site.legal.privacySummary}</p>
          <p>
            When this page is finalized, it should describe cookies or analytics (if any), contact form processors, retention, and how
            visitors can reach you for privacy requests.
          </p>
        </div>
      </Container>
    </div>
  );
}
