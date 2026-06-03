import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { ServiceCheckout } from "@/components/checkout/ServiceCheckout";
import { getBookableService, site } from "@/content/site";
import { parseCeremonyMedicineSlug } from "@/lib/booking/ceremony-medicine";
import { parseReikiAddOnSlugs } from "@/lib/booking/reiki-addon";
import { parsePractitionerSlug } from "@/lib/booking/practitioners";
import { getRegistration } from "@/lib/registration/cookie";

type PageProps = {
  searchParams: Promise<{
    service?: string;
    success?: string;
    canceled?: string;
    practitioner?: string;
    ceremony?: string;
    addon?: string;
  }>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const service = params.service ? getBookableService(params.service) : undefined;
  return {
    title: service ? `Pay · ${service.label}` : site.payments.serviceCheckoutTitle,
    description: site.payments.serviceCheckoutIntro,
  };
}

export default async function ServiceCheckoutPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const serviceSlug = params.service?.trim() ?? "";
  const service = getBookableService(serviceSlug);
  if (!service) notFound();

  const registration = await getRegistration();
  const paymentsReady = Boolean(process.env.STRIPE_SECRET_KEY);
  const practitionerSlug = parsePractitionerSlug(params.practitioner);
  const ceremonyMedicineSlug = parseCeremonyMedicineSlug(params.ceremony);
  const reikiAddOnSlugs = parseReikiAddOnSlugs(params.addon);

  return (
    <>
      <PageHeader title={site.payments.serviceCheckoutTitle} lead={site.payments.serviceCheckoutIntro} centered />
      <div className="section-pad pt-0">
        <Container className="max-w-3xl">
          <Suspense fallback={<p className="prose-content text-muted">Loading checkout…</p>}>
            <ServiceCheckout
              serviceSlug={service.slug}
              serviceLabel={service.label}
              priceCents={service.priceCents}
              registration={registration}
              paymentsReady={paymentsReady}
              success={params.success === "1"}
              canceled={params.canceled === "1"}
              initialPractitioner={practitionerSlug}
              initialCeremonyMedicine={ceremonyMedicineSlug}
              initialReikiAddOns={reikiAddOnSlugs}
            />
          </Suspense>
        </Container>
      </div>
    </>
  );
}
