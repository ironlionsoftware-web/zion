import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { RegisterForm } from "@/components/registration/RegisterForm";
import { getRegistration } from "@/lib/registration/cookie";
import { parseCeremonyMedicineSlug } from "@/lib/booking/ceremony-medicine";
import { parseReikiAddOnSlug } from "@/lib/booking/reiki-addon";
import { parsePractitionerSlug } from "@/lib/booking/practitioners";
import { parseRegisterNext, redirectAfterRegistration } from "@/lib/registration/redirect";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: site.registration.title,
  description: site.registration.intro,
};

type PageProps = {
  searchParams: Promise<{
    next?: string;
    service?: string;
    booking?: string;
    participant?: string;
    practitioner?: string;
    ceremony?: string;
    addon?: string;
  }>;
};

export default async function RegisterPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const next = parseRegisterNext(params.next);
  const serviceSlug = params.service?.trim();
  const bookingId = params.booking?.trim();
  const participantIndex = params.participant ? Number(params.participant) : undefined;
  const practitionerSlug = parsePractitionerSlug(params.practitioner);
  const ceremonyMedicineSlug = parseCeremonyMedicineSlug(params.ceremony);
  const reikiAddOnSlug = parseReikiAddOnSlug(params.addon);
  const existing = await getRegistration();

  if (existing) {
    const { url, external } = redirectAfterRegistration(next, existing, {
      serviceSlug,
      bookingId,
      participantIndex: Number.isInteger(participantIndex) ? participantIndex : undefined,
      practitionerSlug,
      ceremonyMedicineSlug,
      reikiAddOnSlug,
    });
    if (external) {
      redirect(url);
    }
    redirect(url);
  }

  const serviceLabel = serviceSlug
    ? site.healingServices.services.find((s) => s.slug === serviceSlug)?.label
    : undefined;
  const lead = serviceLabel
    ? `${site.registration.intro} You selected: ${serviceLabel}.`
    : site.registration.intro;

  return (
    <>
      <PageHeader title={site.registration.title} lead={lead} centered />
      <div className="section-pad pt-0">
        <Container className="max-w-3xl">
          <RegisterForm
            next={next}
            service={serviceSlug}
            bookingId={bookingId}
            participantIndex={Number.isInteger(participantIndex) ? participantIndex : undefined}
            initialPractitioner={practitionerSlug}
            initialCeremonyMedicine={ceremonyMedicineSlug}
            initialReikiAddOn={reikiAddOnSlug ?? ""}
          />
          <p className="prose-content mt-8 text-sm">
            <Link href="/healing-services" className="link-accent font-medium hover:underline">
              ← Back to Healing Services & Classes
            </Link>
          </p>
        </Container>
      </div>
    </>
  );
}
