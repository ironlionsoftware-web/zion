import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  robots: { index: false, follow: false },
};

export default function PrivacyPage() {
  return (
    <>
      <PageHeader title="Privacy policy (draft)" centered />
      <div className="section-pad pt-0">
        <Container className="max-w-3xl">
          <p className="text-sm font-medium text-[var(--rasta-red)]">
            Placeholder, not legal advice. Review with counsel before publishing.
          </p>
          <div className="prose-content mt-8 space-y-4">
            <p>{site.legal.privacySummary}</p>
            <p>
              When this page is finalized, it should describe cookies or analytics (if any), contact form processors,
              retention, and how visitors can reach you for privacy requests.
            </p>
          </div>
        </Container>
      </div>
    </>
  );
}
