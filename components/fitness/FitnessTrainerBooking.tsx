"use client";

import Link from "next/link";
import { useState } from "react";
import { getFitnessTrainers } from "@/lib/booking/fitness-trainers";
import { calendlyUrlWithPrefill, registerHref } from "@/lib/registration/redirect";
import { isCalendlyConfigured } from "@/content/site";
import type { ClientRegistration } from "@/lib/registration/types";
import { site } from "@/content/site";

type FitnessTrainerBookingProps = {
  registration: ClientRegistration | null;
};

export function FitnessTrainerBooking({ registration }: FitnessTrainerBookingProps) {
  const cfg = site.fitnessTraining.booking;
  const trainers = getFitnessTrainers();
  const [selected, setSelected] = useState<string>(trainers[0]?.slug ?? "");
  const calendlyReady = isCalendlyConfigured();

  const activeTrainer = trainers.find((t) => t.slug === selected);

  return (
    <section
      id="book-training"
      className="mx-auto mt-14 max-w-3xl scroll-mt-24 border-t border-subtle pt-14"
      aria-labelledby="fitness-booking-heading"
    >
      <h2 id="fitness-booking-heading" className="font-display text-2xl font-medium text-[var(--foreground)]">
        {cfg.heading}
      </h2>
      <p className="prose-content mt-4">{cfg.lead}</p>

      <fieldset className="card mt-8 p-6 sm:p-8">
        <legend className="text-sm font-semibold text-[var(--foreground)]">{cfg.trainerLegend}</legend>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {trainers.map((trainer) => (
            <label
              key={trainer.slug}
              className={`cursor-pointer rounded-sm border p-4 transition has-focus-visible:ring-2 has-focus-visible:ring-[var(--rasta-gold)] has-focus-visible:ring-offset-2 ${selected === trainer.slug ? "border-[var(--rasta-green)] ring-1 ring-[var(--rasta-green)]" : "border-subtle"}`}
            >
              <input
                type="radio"
                name="fitness-trainer"
                value={trainer.slug}
                checked={selected === trainer.slug}
                onChange={() => setSelected(trainer.slug)}
                className="sr-only"
              />
              <span className="block font-medium text-[var(--foreground)]">{trainer.name}</span>
              <span className="mt-1 block text-xs text-muted">{trainer.title}</span>
            </label>
          ))}
        </div>

        {registration && activeTrainer && calendlyReady ? (
          <a
            href={calendlyUrlWithPrefill(registration, activeTrainer.slug)}
            className="btn btn-primary mt-8 w-full sm:w-auto"
            target="_blank"
            rel="noopener noreferrer"
          >
            Schedule with {activeTrainer.name}
            <span className="sr-only"> (opens Calendly in a new tab)</span>
          </a>
        ) : (
          <Link
            href={registerHref("book", { practitionerSlug: selected })}
            className="btn btn-primary mt-8 w-full sm:w-auto"
          >
            {registration ? `Schedule with ${activeTrainer?.name ?? "your trainer"}` : "Register to book"}
          </Link>
        )}

        {!calendlyReady ? (
          <p className="mt-4 text-sm text-muted">
            Online scheduling is being set up.{" "}
            <Link href="/contact" className="link-accent font-medium hover:underline">
              Contact us
            </Link>{" "}
            to book with {activeTrainer?.name ?? "a trainer"}.
          </p>
        ) : null}

        {registration ? (
          <p className="mt-4 text-sm text-muted">
            Signed in as <strong className="text-[var(--foreground)]">{registration.fullName}</strong>. Pick a
            trainer, then open Calendly to choose your time.
          </p>
        ) : (
          <p className="mt-4 text-sm text-muted">
            Register once, then you will be taken to Calendly to pick a time with your trainer.
          </p>
        )}
      </fieldset>
    </section>
  );
}
