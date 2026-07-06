"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { buildCalendlyEmbedUrl, formatScheduledSlot, type ScheduledSlot } from "@/lib/booking/calendly-schedule";
import { getPractitioner } from "@/lib/booking/practitioners";
import { calendlyUrlWithPrefill } from "@/lib/registration/redirect";
import { isCalendlyConfigured, site } from "@/content/site";
import type { ClientRegistration } from "@/lib/registration/types";

type CalendlyMessage = {
  event?: string;
  payload?: {
    event?: {
      uri?: string;
      start_time?: string;
      end_time?: string;
    };
  };
};

type CalendlySchedulerProps = {
  registration: ClientRegistration;
  practitionerSlug: string;
  value: ScheduledSlot | null;
  onChange: (slot: ScheduledSlot | null) => void;
  disabled?: boolean;
};

export function CalendlyScheduler({
  registration,
  practitionerSlug,
  value,
  onChange,
  disabled,
}: CalendlySchedulerProps) {
  const headingId = useId();
  const configured = isCalendlyConfigured();
  const practitioner = getPractitioner(practitionerSlug);
  const [embedKey, setEmbedKey] = useState(0);

  useEffect(() => {
    onChange(null);
    setEmbedKey((key) => key + 1);
  }, [practitionerSlug]); // reset slot when practitioner changes

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== "https://calendly.com") return;
      const data = event.data as CalendlyMessage;
      if (data.event !== "calendly.event_scheduled") return;

      const scheduled = data.payload?.event;
      const startTime = scheduled?.start_time?.trim();
      const endTime = scheduled?.end_time?.trim();
      const eventUri = scheduled?.uri?.trim();
      if (!startTime || !endTime || !eventUri) return;

      onChange({
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        eventUri,
      });
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onChange]);

  if (!configured) {
    return (
      <section className="card p-6 sm:p-8" aria-labelledby={headingId}>
        <h2 id={headingId} className="font-display text-xl font-medium text-[var(--foreground)]">
          {site.calendly.heading}
        </h2>
        <p className="mt-3 text-sm text-muted">
          Online scheduling is being set up.{" "}
          <Link href="/contact" className="link-accent font-medium hover:underline">
            Contact us
          </Link>{" "}
          to book a time before paying.
        </p>
      </section>
    );
  }

  if (!practitioner) return null;

  const embedSrc = buildCalendlyEmbedUrl(registration, practitionerSlug);
  const openUrl = calendlyUrlWithPrefill(registration, practitionerSlug);

  return (
    <section className="card p-6 sm:p-8" aria-labelledby={headingId}>
      <h2 id={headingId} className="font-display text-xl font-medium text-[var(--foreground)]">
        {site.calendly.heading}
      </h2>
      <p className="mt-2 text-sm text-muted">
        Pick a date and time with <strong className="text-[var(--foreground)]">{practitioner.name}</strong> before
        completing payment.
      </p>

      {value ? (
        <p className="mt-4 rounded-sm border border-[var(--rasta-green)] bg-[var(--rasta-green)]/10 p-4 text-sm" role="status">
          <span className="font-semibold text-[var(--foreground)]">Time selected:</span>{" "}
          {formatScheduledSlot(value)}
          {!disabled ? (
            <>
              {" "}
              <button
                type="button"
                onClick={() => {
                  onChange(null);
                  setEmbedKey((key) => key + 1);
                }}
                className="link-accent font-medium hover:underline"
              >
                Choose a different time
              </button>
            </>
          ) : null}
        </p>
      ) : null}

      {!value ? (
        <>
          <iframe
            key={embedKey}
            title={`Schedule with ${practitioner.name}`}
            src={embedSrc}
            className="mt-6 h-[min(700px,75dvh)] w-full max-w-full rounded-sm border border-subtle sm:h-[700px]"
          />
          <p className="mt-4 text-sm text-muted">
            Scheduler not loading?{" "}
            <a href={openUrl} className="link-accent font-medium hover:underline" target="_blank" rel="noopener noreferrer">
              Open Calendly in a new tab
              <span className="sr-only"> (opens in new tab)</span>
            </a>
            .
          </p>
        </>
      ) : null}
    </section>
  );
}
