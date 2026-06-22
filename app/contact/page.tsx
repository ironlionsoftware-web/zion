import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { ContactForm } from "@/components/contact/ContactForm";
import { NatureFeature } from "@/components/sections/NatureFeature";
import { austinLandscapePhotos, site } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description: site.contact.intro,
};

export default function ContactPage() {
  const mailto = `mailto:${site.contact.email}?subject=${encodeURIComponent("Iron Lion inquiry")}`;

  return (
    <>
      <PageHeader title="Contact Us" lead={site.contact.intro} centered />
      <div className="section-pad pt-0">
        <Container className="max-w-4xl">
          <div className="grid gap-4 sm:grid-cols-2">
            <NatureFeature photo={site.nature.photos[0]} label={site.nature.label} />
            <NatureFeature photo={austinLandscapePhotos[3]} label="Austin, Texas" />
          </div>
        </Container>
      </div>
      <div className="pb-14 pt-0 sm:pb-20">
        <Container className="max-w-3xl">
          <dl className="space-y-8 text-base">
            <div>
              <dt className="eyebrow">Email</dt>
              <dd className="mt-2">
                <a
                  href={mailto}
                  className="link-accent inline-flex min-h-11 items-center text-lg font-medium outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[var(--rasta-gold)] focus-visible:ring-offset-2"
                >
                  {site.contact.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="eyebrow">Phone</dt>
              <dd className="mt-2">
                <a
                  href={`tel:${site.contact.phoneTel}`}
                  className="link-accent inline-flex min-h-11 items-center text-lg font-medium outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[var(--rasta-gold)] focus-visible:ring-offset-2"
                >
                  {site.contact.phoneDisplay}
                </a>
                <p className="mt-1 text-sm text-muted">{site.contact.phoneNote}</p>
              </dd>
            </div>
            <div>
              <dt className="eyebrow">Service area</dt>
              <dd className="mt-2 text-muted">{site.contact.serviceArea}</dd>
            </div>
          </dl>

          <ContactForm />

          <p className="prose-content mt-12 text-sm">
            Prefer to start with a topic? See{" "}
            <a
              href="/healing-services"
              className="link-accent font-medium outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[var(--rasta-gold)] focus-visible:ring-offset-2"
            >
              Healing Services & Classes
            </a>{" "}
            to book a specific offering, or{" "}
            <a
              href="/shop"
              className="link-accent font-medium outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[var(--rasta-gold)] focus-visible:ring-offset-2"
            >
              Shop plant medicine
            </a>{" "}
            to browse the apothecary.
          </p>
        </Container>
      </div>
    </>
  );
}
