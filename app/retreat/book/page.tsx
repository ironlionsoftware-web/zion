import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { RetreatBookingForm } from "@/components/retreat/RetreatBookingForm";
import { formatRetreatUsd, retreatPricing } from "@/lib/retreat/booking";
import { site } from "@/content/site";

const cfg = site.retreat.booking;

export const metadata: Metadata = {
  title: cfg.pageTitle,
  description: cfg.pageIntro,
};

export default function RetreatBookPage() {
  const pricing = retreatPricing();

  return (
    <>
      <PageHeader title={cfg.pageTitle} lead={cfg.pageIntro} centered />
      <div className="section-pad pt-0">
        <Container className="max-w-3xl">
          <div className="card prose-content space-y-3 p-5 text-sm">
            <p>
              <strong>{formatRetreatUsd(pricing.totalCents)}</strong> per person for most retreats ·{" "}
              <strong>fitness retreat: {formatRetreatUsd(300_000)} (2 weeks) or {formatRetreatUsd(500_000)} (1 month)</strong>{" "}
              · all inclusive
            </p>
            <p>
              <strong>{formatRetreatUsd(pricing.depositCents)}</strong> deposit now for every retreat · balance due{" "}
              {pricing.balanceDueMinWeeks} to {pricing.balanceDueMaxWeeks} weeks after deposit (amount depends on retreat
              and length)
            </p>
            <p>Groups: {pricing.minParticipants} to {pricing.maxParticipants} participants.</p>
            {site.retreat.allInclusive.paragraphs.map((para, j) => (
              <p key={j} className={j === 0 ? "border-t border-subtle pt-3" : undefined}>
                {para}
              </p>
            ))}
          </div>
          <RetreatBookingForm />
          <p className="prose-content mt-8 text-sm">
            <Link href="/retreat" className="link-accent font-medium hover:underline">
              ← Back to Retreat
            </Link>
          </p>
        </Container>
      </div>
    </>
  );
}
