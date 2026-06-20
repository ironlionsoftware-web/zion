import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { DonationConfirm } from "@/components/donation/DonationConfirm";
import { DonationForm } from "@/components/donation/DonationForm";
import { site } from "@/content/site";
import { requireClientRegistration } from "@/lib/registration/require-page";

export const metadata: Metadata = {
  title: site.donation.title,
  description: site.donation.intro,
};

type PageProps = {
  searchParams: Promise<{ success?: string; canceled?: string }>;
};

export default async function DonationPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const paymentsReady = Boolean(process.env.STRIPE_SECRET_KEY);
  const registration = await requireClientRegistration({ next: "donation" });
  const d = site.donation;

  return (
    <>
      <PageHeader title={d.title} lead={d.intro} centered />
      <div className="section-pad pt-0">
        <Container className="max-w-3xl">
          <Suspense fallback={null}>
            <DonationConfirm />
          </Suspense>
          {params.success ? (
            <p className="card mb-8 border-[var(--rasta-green)] p-4 text-sm leading-relaxed text-[var(--foreground)]" role="status">
              Thank you for your contribution. We received your payment and appreciate your support.
            </p>
          ) : null}
          {params.canceled ? (
            <p className="card mb-8 p-4 text-sm leading-relaxed text-muted" role="status">
              Checkout was canceled. You can adjust your amount and try again when you are ready.
            </p>
          ) : null}
          <p className="card mb-8 p-4 text-sm text-[var(--foreground)]" role="status">
            Contributing as <strong>{registration.fullName}</strong> ({registration.email})
          </p>

          <DonationForm paymentsReady={paymentsReady} />

          <p className="prose-content mt-10 text-sm">
            <Link href="/healing-services" className="link-accent font-medium hover:underline">
              ← Back to Healing Services & Classes
            </Link>
          </p>
        </Container>
      </div>
    </>
  );
}
