import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  robots: { index: false, follow: false },
};

/**
 * Still a draft, and still needs counsel. What changed is that it now describes
 * what the site actually does rather than promising to one day say so: a
 * third-party advertising tracker is live, and a visitor cannot object to
 * something nobody has told them about.
 *
 * The Meta entry appears only where the pixel is actually configured, so a
 * deployment without one never claims to share data it does not share.
 */
function dataRecipients(pixelConfigured: boolean) {
  return [
    {
      who: "Stripe",
      what: "Card payments. Your card details go to Stripe directly and are never stored on this site.",
    },
    {
      who: "Calendly",
      what: "Appointment scheduling, including the name and email you book under.",
    },
    {
      who: "SendGrid",
      what: "Sending booking confirmations and receipts to your email address.",
    },
    {
      who: "OpenAI",
      what: 'Only if you use "Find your path": what you type in that box is sent to OpenAI to generate a suggestion.',
    },
    ...(pixelConfigured
      ? [
          {
            who: "Meta (Facebook)",
            what: "Pages you view here, and whether you register or complete a purchase, are reported to Meta so our advertising can be measured. Your name and email are not sent.",
          },
        ]
      : []),
  ];
}

export default function PrivacyPage() {
  const pixelConfigured = Boolean(process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim());
  const recipients = dataRecipients(pixelConfigured);

  return (
    <>
      <PageHeader title="Privacy policy (draft)" centered />
      <div className="section-pad pt-0">
        <Container className="max-w-3xl">
          <p className="text-sm font-medium text-[var(--brand-emphasis)]">
            Draft, not legal advice. Review with counsel before relying on it.
          </p>

          <div className="prose-content mt-8 space-y-4">
            <p>{site.legal.privacySummary}</p>
          </div>

          <section aria-labelledby="privacy-collect" className="mt-12">
            <h2 id="privacy-collect" className="section-title">
              What this site collects
            </h2>
            <ul className="mt-6 space-y-3">
              <li className="prose-content">
                <strong>What you give us.</strong> Your name, email and phone when you register,
                plus whether you agreed to marketing emails. Details you enter for a booking, order
                or retreat, including any dietary or mobility notes you choose to share.
              </li>
              <li className="prose-content">
                <strong>How the site is used.</strong> Which pages are visited and where visitors
                arrived from, tied to a random id stored in your browser. It is not linked to your
                name.
              </li>
            </ul>
          </section>

          <section aria-labelledby="privacy-share" className="mt-12">
            <h2 id="privacy-share" className="section-title">
              Who else receives it
            </h2>
            <p className="prose-content mt-4">
              We do not sell your information. These services receive what they need to do their
              job:
            </p>
            <ul className="mt-6 space-y-3">
              {recipients.map((r) => (
                <li key={r.who} className="prose-content">
                  <strong>{r.who}.</strong> {r.what}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="privacy-choices" className="mt-12">
            <h2 id="privacy-choices" className="section-title">
              Your choices
            </h2>
            <ul className="mt-6 space-y-3">
              <li className="prose-content">
                Marketing emails are opt-in, and every one carries an unsubscribe link.
              </li>
              <li className="prose-content">
                Most browsers can block advertising trackers, and browser settings or extensions
                will stop the Meta pixel described above.
              </li>
              <li className="prose-content">
                To ask what we hold about you, or to have it deleted, email{" "}
                <a href={`mailto:${site.contact.email}`} className="link-accent">
                  {site.contact.email}
                </a>
                .
              </li>
            </ul>
          </section>

          <p className="text-muted mt-12 text-sm">
            Still to be settled with counsel: how long records are kept, and the specific wording
            required for health-related information.
          </p>
        </Container>
      </div>
    </>
  );
}
