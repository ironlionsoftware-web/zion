import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Terms of use",
  robots: { index: false, follow: false },
};

export default function TermsPage() {
  return (
    <>
      <PageHeader title="Terms of use (draft)" centered />
      <div className="section-pad pt-0">
        <Container className="max-w-3xl">
          <p className="text-sm font-medium text-[var(--rasta-red)]">
            Placeholder, not legal advice. Review with counsel before publishing.
          </p>
          <div className="prose-content mt-8 space-y-4">
            <p>{site.legal.termsSummary}</p>
            <p>
              When this page is finalized, it should cover acceptable use, liability limits, and any future booking or
              commerce terms.
            </p>
          </div>
        </Container>
      </div>
    </>
  );
}
