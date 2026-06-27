import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { RegisterForm } from "@/components/registration/RegisterForm";
import { getRegistration } from "@/lib/registration/cookie";
import { parseCeremonyMedicineSlug } from "@/lib/booking/ceremony-medicine";
import { parseReikiAddOnSlugs } from "@/lib/booking/reiki-addon";
import { parsePractitionerSlug } from "@/lib/booking/practitioners";
import { shouldIncludeFitnessOnlyPractitioner, isFitnessTrainingService } from "@/lib/booking/fitness-trainers";
import { parseFitnessBookingOptions } from "@/lib/booking/fitness-options";
import { parseRegisterNext, redirectAfterRegistration } from "@/lib/registration/redirect";
import { getBookableService, site } from "@/content/site";

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
    session?: string;
    audience?: string;
    frequency?: string;
    billing?: string;
  }>;
};

export default async function RegisterPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const next = parseRegisterNext(params.next);
  const serviceSlug = params.service?.trim();
  const bookingId = params.booking?.trim();
  const participantIndex = params.participant ? Number(params.participant) : undefined;
  const practitionerSlug = parsePractitionerSlug(params.practitioner, {
    includeFitnessOnly: shouldIncludeFitnessOnlyPractitioner(serviceSlug),
  });
  const ceremonyMedicineSlug = parseCeremonyMedicineSlug(params.ceremony);
  const reikiAddOnSlugs = parseReikiAddOnSlugs(params.addon);
  const fitnessOptions = isFitnessTrainingService(serviceSlug)
    ? parseFitnessBookingOptions({
        session: params.session,
        audience: params.audience,
        frequency: params.frequency,
        billing: params.billing,
      })
    : undefined;
  const existing = await getRegistration();

  if (existing) {
    const { url, external } = redirectAfterRegistration(next, existing, {
      serviceSlug,
      bookingId,
      participantIndex: Number.isInteger(participantIndex) ? participantIndex : undefined,
      practitionerSlug,
      ceremonyMedicineSlug,
      reikiAddOnSlugs,
      fitnessOptions,
    });
    if (external) {
      redirect(url);
    }
    redirect(url);
  }

  const serviceLabel = serviceSlug ? getBookableService(serviceSlug)?.label : undefined;
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
            initialReikiAddOns={reikiAddOnSlugs}
            initialFitnessOptions={fitnessOptions}
          />
          <p className="prose-content mt-8 text-sm">
            <Link
              href={isFitnessTrainingService(serviceSlug) ? "/fitness-training" : "/healing-services"}
              className="link-accent font-medium hover:underline"
            >
              {isFitnessTrainingService(serviceSlug)
                ? "← Back to Fitness Training"
                : "← Back to Healing Services & Classes"}
            </Link>
          </p>
        </Container>
      </div>
    </>
  );
}
