import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { RetreatBookingHub } from "@/components/retreat/RetreatBookingHub";
import { requireClientRegistration } from "@/lib/registration/require-page";
import { registrationOwnsBooking } from "@/lib/retreat/booking";
import { getRetreatBooking } from "@/lib/retreat/storage";
import { site } from "@/content/site";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ participant?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const booking = await getRetreatBooking(id);
  return {
    title: booking ? site.retreat.booking.hubTitle : "Retreat booking",
    description: site.retreat.booking.hubIntro,
  };
}

export default async function RetreatBookingPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const query = await searchParams;
  const booking = await getRetreatBooking(id);
  if (!booking) notFound();

  const highlightParticipant = query.participant ? Number(query.participant) : undefined;
  const registration = await requireClientRegistration({
    next: "retreat",
    booking: id,
    participant: Number.isInteger(highlightParticipant) ? highlightParticipant : undefined,
  });

  // Being registered is not the same as being on *this* booking. Registration is self-service with
  // no email verification, and the booking id appears in Stripe redirect URLs — so without this
  // check anyone holding the link could read every participant's contact and health details.
  if (!registrationOwnsBooking(booking, registration)) {
    return (
      <>
        <PageHeader
          title="This booking is under a different email"
          lead={`You are signed in as ${registration.email}, which is not listed on this retreat booking.`}
          centered
        />
        <div className="section-pad pt-0">
          <Container className="max-w-2xl">
            <p className="prose-content">
              Register again using the same email address you gave on the retreat registration form
              and you will be able to see your booking and pay your deposit or balance. If you are
              not sure which email was used, contact us at{" "}
              <a href={`mailto:${site.contact.email}`} className="link-accent font-medium hover:underline">
                {site.contact.email}
              </a>{" "}
              and we will look it up for you.
            </p>
            <p className="prose-content mt-8 text-sm">
              <Link
                href={`/register?next=retreat&booking=${encodeURIComponent(id)}`}
                className="link-accent font-medium hover:underline"
              >
                Register with a different email →
              </Link>
            </p>
            <p className="prose-content mt-2 text-sm">
              <Link href="/retreat" className="link-accent font-medium hover:underline">
                ← Back to Retreat
              </Link>
            </p>
          </Container>
        </div>
      </>
    );
  }

  const paymentsReady = Boolean(process.env.STRIPE_SECRET_KEY);

  return (
    <>
      <PageHeader title={site.retreat.booking.hubTitle} lead={site.retreat.booking.hubIntro} centered />
      <div className="section-pad pt-0">
        <Container className="max-w-3xl">
          <RetreatBookingHub
            bookingId={id}
            initialBooking={booking}
            registration={registration}
            paymentsReady={paymentsReady}
            highlightParticipant={Number.isInteger(highlightParticipant) ? highlightParticipant : undefined}
          />
          <p className="prose-content mt-10 text-sm">
            <Link href="/retreat" className="link-accent font-medium hover:underline">
              ← Back to Retreat
            </Link>
          </p>
        </Container>
      </div>
    </>
  );
}
