"use client";

import Link from "next/link";
import { useState } from "react";
import { PractitionerPicker } from "@/components/booking/PractitionerPicker";
import { isCalendlyConfigured, site } from "@/content/site";
import { getPractitioners } from "@/lib/booking/practitioners";
import { calendlyUrlWithPrefill, registerHref } from "@/lib/registration/redirect";
import type { ClientRegistration } from "@/lib/registration/types";

type CalendlyInlineProps = {
  registered: boolean;
  registration?: ClientRegistration | null;
};

function calendlyEmbedSrc(registration: ClientRegistration | null | undefined, practitionerSlug: string): string {
  const url = new URL(calendlyUrlWithPrefill(registration ?? { fullName: "", email: "", phone: "", registeredAt: "" }, practitionerSlug));
  url.searchParams.set("embed_type", "Inline");
  url.searchParams.set("hide_gdpr_banner", "1");
  if (registration) {
    url.searchParams.set("name", registration.fullName);
    url.searchParams.set("email", registration.email);
  }
  try {
    url.searchParams.set("embed_domain", new URL(site.url).hostname);
  } catch {
    /* ignore invalid site.url during local dev */
  }
  return url.toString();
}

export function CalendlyInline({ registered, registration }: CalendlyInlineProps) {
  const configured = isCalendlyConfigured();
  const [practitioner, setPractitioner] = useState<string>(getPractitioners()[0]?.slug ?? "");

  return (
    <section id="book" className="mt-16 scroll-mt-24 border-t border-subtle pt-16" aria-labelledby="calendly-heading">
      <h2 id="calendly-heading" className="section-title">
        {site.calendly.heading}
      </h2>
      <p className="prose-content mt-4 max-w-2xl">{site.calendly.lead}</p>
      {!registered ? (
        <div className="card mt-8 p-6 sm:p-8">
          <PractitionerPicker value={practitioner} onChange={setPractitioner} name="calendly-practitioner" />
          <p className="prose-content mt-6 text-sm">{site.registration.intro}</p>
          <Link
            href={registerHref("book", { practitionerSlug: practitioner })}
            className="btn btn-primary mt-6 inline-flex"
          >
            Register to schedule
          </Link>
        </div>
      ) : configured ? (
        <>
          <div className="mt-8 max-w-2xl">
            <PractitionerPicker value={practitioner} onChange={setPractitioner} name="calendly-practitioner" />
          </div>
          <iframe
            title={site.calendly.heading}
            src={calendlyEmbedSrc(registration, practitioner)}
            className="card mt-8 h-[min(700px,75dvh)] w-full max-w-full sm:h-[700px]"
          />
          <p className="mt-4 text-sm text-muted">
            Scheduler not loading?{" "}
            <a
              href={
                registration
                  ? calendlyUrlWithPrefill(registration, practitioner)
                  : (getPractitioners().find((p) => p.slug === practitioner)?.calendlyUrl ?? site.calendly.url).trim()
              }
              className="link-accent font-medium hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Calendly in a new tab
              <span className="sr-only"> (opens in new tab)</span>
            </a>
            .
          </p>
        </>
      ) : (
        <p className="card mt-8 p-6 text-sm leading-relaxed text-muted">
          Online scheduling will appear here once your Calendly link is added in{" "}
          <code className="rounded bg-[var(--surface-muted)] px-1 py-0.5 text-xs">content/site.ts</code>. Until then,{" "}
          <Link href="/contact" className="link-accent font-medium hover:underline">
            contact us
          </Link>{" "}
          to book Reiki, training, or other sessions.
        </p>
      )}
    </section>
  );
}
