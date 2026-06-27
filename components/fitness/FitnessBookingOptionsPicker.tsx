"use client";

import { site } from "@/content/site";
import {
  getFitnessAudienceTypes,
  getFitnessBillingModes,
  getFitnessSessionTypes,
  getFitnessSessionsPerWeekOptions,
  type FitnessBookingOptions,
} from "@/lib/booking/fitness-options";

type FitnessBookingOptionsPickerProps = {
  value: FitnessBookingOptions;
  onChange: (options: FitnessBookingOptions) => void;
  disabled?: boolean;
};

export function FitnessBookingOptionsPicker({
  value,
  onChange,
  disabled,
}: FitnessBookingOptionsPickerProps) {
  const cfg = site.fitnessTraining.booking;
  const sessionTypes = getFitnessSessionTypes();
  const audienceTypes = getFitnessAudienceTypes();
  const frequencyOptions = getFitnessSessionsPerWeekOptions();
  const billingModes = getFitnessBillingModes();

  return (
    <div className="space-y-6">
      <fieldset disabled={disabled}>
        <legend className="text-sm font-semibold text-[var(--foreground)]">{cfg.sessionTypeLegend}</legend>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {sessionTypes.map((option) => (
            <label
              key={option.slug}
              className={`cursor-pointer rounded-sm border p-4 transition has-focus-visible:ring-2 has-focus-visible:ring-[var(--rasta-gold)] has-focus-visible:ring-offset-2 ${value.sessionType === option.slug ? "border-[var(--rasta-green)] ring-1 ring-[var(--rasta-green)]" : "border-subtle"} ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
            >
              <input
                type="radio"
                name="fitness-session-type"
                value={option.slug}
                checked={value.sessionType === option.slug}
                onChange={() => onChange({ ...value, sessionType: option.slug })}
                className="sr-only"
              />
              <span className="block font-medium text-[var(--foreground)]">{option.label}</span>
              <span className="mt-1 block text-xs text-muted">{option.summary}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset disabled={disabled}>
        <legend className="text-sm font-semibold text-[var(--foreground)]">{cfg.audienceLegend}</legend>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {audienceTypes.map((option) => (
            <label
              key={option.slug}
              className={`cursor-pointer rounded-sm border p-4 transition has-focus-visible:ring-2 has-focus-visible:ring-[var(--rasta-gold)] has-focus-visible:ring-offset-2 ${value.audience === option.slug ? "border-[var(--rasta-green)] ring-1 ring-[var(--rasta-green)]" : "border-subtle"} ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
            >
              <input
                type="radio"
                name="fitness-audience"
                value={option.slug}
                checked={value.audience === option.slug}
                onChange={() => onChange({ ...value, audience: option.slug })}
                className="sr-only"
              />
              <span className="block font-medium text-[var(--foreground)]">{option.label}</span>
              <span className="mt-1 block text-xs text-muted">{option.summary}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset disabled={disabled}>
        <legend className="text-sm font-semibold text-[var(--foreground)]">{cfg.frequencyLegend}</legend>
        <div className="mt-4 flex flex-wrap gap-2">
          {frequencyOptions.map((count) => (
            <label
              key={count}
              className={`cursor-pointer rounded-sm border px-4 py-2 text-sm transition has-focus-visible:ring-2 has-focus-visible:ring-[var(--rasta-gold)] has-focus-visible:ring-offset-2 ${value.sessionsPerWeek === count ? "border-[var(--rasta-green)] bg-[var(--rasta-green)]/10 font-medium text-[var(--foreground)] ring-1 ring-[var(--rasta-green)]" : "border-subtle text-muted"} ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
            >
              <input
                type="radio"
                name="fitness-frequency"
                value={count}
                checked={value.sessionsPerWeek === count}
                onChange={() => onChange({ ...value, sessionsPerWeek: count })}
                className="sr-only"
              />
              {count}×
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset disabled={disabled}>
        <legend className="text-sm font-semibold text-[var(--foreground)]">{cfg.billingLegend}</legend>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {billingModes.map((option) => (
            <label
              key={option.slug}
              className={`cursor-pointer rounded-sm border p-4 transition has-focus-visible:ring-2 has-focus-visible:ring-[var(--rasta-gold)] has-focus-visible:ring-offset-2 ${value.billingMode === option.slug ? "border-[var(--rasta-green)] ring-1 ring-[var(--rasta-green)]" : "border-subtle"} ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
            >
              <input
                type="radio"
                name="fitness-billing"
                value={option.slug}
                checked={value.billingMode === option.slug}
                onChange={() => onChange({ ...value, billingMode: option.slug })}
                className="sr-only"
              />
              <span className="block font-medium text-[var(--foreground)]">{option.label}</span>
              <span className="mt-1 block text-xs text-muted">{option.summary}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
