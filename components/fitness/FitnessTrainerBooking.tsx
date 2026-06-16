"use client";

import Link from "next/link";
import { useState } from "react";
import { FitnessTrainerPicker } from "@/components/fitness/FitnessTrainerPicker";
import {
  FITNESS_TRAINING_SERVICE_SLUG,
  getFitnessTrainers,
} from "@/lib/booking/fitness-trainers";
import { registerHref } from "@/lib/registration/redirect";
import { formatSlidingScaleRange } from "@/lib/booking/sliding-scale";
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
  const checkoutHref = `/checkout/service?service=${FITNESS_TRAINING_SERVICE_SLUG}&practitioner=${encodeURIComponent(selected)}`;

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
      <p className="mt-2 text-sm font-medium text-[var(--rasta-green)]">
        {formatSlidingScaleRange(cfg.slidingScale)} sliding scale per session
      </p>

      <fieldset className="card mt-8 p-6 sm:p-8">
        <FitnessTrainerPicker value={selected} onChange={setSelected} />

        {registration && activeTrainer ? (
          <Link href={checkoutHref} className="btn btn-primary mt-8 w-full sm:w-auto">
            Pay & schedule with {activeTrainer.name}
          </Link>
        ) : (
          <Link
            href={registerHref("book", {
              serviceSlug: FITNESS_TRAINING_SERVICE_SLUG,
              practitionerSlug: selected,
            })}
            className="btn btn-primary mt-8 w-full sm:w-auto"
          >
            Register to book
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
            trainer, choose your sliding scale amount, then schedule on Calendly.
          </p>
        ) : (
          <p className="mt-4 text-sm text-muted">
            Register once, then pay on the sliding scale and pick a time with your trainer on Calendly.
          </p>
        )}
      </fieldset>
    </section>
  );
}
