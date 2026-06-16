"use client";

import { site } from "@/content/site";
import { getFitnessTrainers } from "@/lib/booking/fitness-trainers";

type FitnessTrainerPickerProps = {
  value: string;
  onChange: (slug: string) => void;
  disabled?: boolean;
  name?: string;
};

export function FitnessTrainerPicker({
  value,
  onChange,
  disabled,
  name = "fitness-trainer",
}: FitnessTrainerPickerProps) {
  const cfg = site.fitnessTraining.booking;
  const trainers = getFitnessTrainers();

  return (
    <fieldset className="mt-6" disabled={disabled}>
      <legend className="text-sm font-semibold text-[var(--foreground)]">{cfg.trainerLegend}</legend>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {trainers.map((trainer) => (
          <label
            key={trainer.slug}
            className={`cursor-pointer rounded-sm border p-4 transition has-focus-visible:ring-2 has-focus-visible:ring-[var(--rasta-gold)] has-focus-visible:ring-offset-2 ${value === trainer.slug ? "border-[var(--rasta-green)] ring-1 ring-[var(--rasta-green)]" : "border-subtle"} ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
          >
            <input
              type="radio"
              name={name}
              value={trainer.slug}
              checked={value === trainer.slug}
              onChange={() => onChange(trainer.slug)}
              className="sr-only"
            />
            <span className="block font-medium text-[var(--foreground)]">{trainer.name}</span>
            <span className="mt-1 block text-xs text-muted">{trainer.title}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
