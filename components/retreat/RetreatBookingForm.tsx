"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RetreatDurationPicker } from "@/components/retreat/RetreatDurationPicker";
import { RetreatTypePicker } from "@/components/retreat/RetreatTypePicker";
import { site } from "@/content/site";
import { formatRetreatPriceSummary, resolveRetreatPricing, retreatHasDurationOptions } from "@/lib/retreat/pricing";
import { FITNESS_RETREAT_SLUG, getRetreatParticipantLimits, getRetreatType, getRetreatTypes } from "@/lib/retreat/retreat-types";
import type { RetreatMobilityLevel } from "@/lib/retreat/types";

type ParticipantDraft = {
  fullName: string;
  email: string;
  phone: string;
  age: string;
  dietaryRestrictionsAndAllergies: string;
  fitnessMobilityLevel: RetreatMobilityLevel | "";
  marketingConsent: boolean;
};

function emptyParticipant(): ParticipantDraft {
  return {
    fullName: "",
    email: "",
    phone: "",
    age: "",
    dietaryRestrictionsAndAllergies: "",
    fitnessMobilityLevel: "",
    marketingConsent: false,
  };
}

export function RetreatBookingForm() {
  const router = useRouter();
  const cfg = site.retreat.booking;
  const fitnessType = getRetreatType(FITNESS_RETREAT_SLUG);
  const defaultFitnessDuration =
    fitnessType && "durationOptions" in fitnessType ? fitnessType.durationOptions[0]?.slug ?? "" : "";

  const [retreatType, setRetreatType] = useState<string>(getRetreatTypes()[0]?.slug ?? "");
  const [retreatDuration, setRetreatDuration] = useState<string>(defaultFitnessDuration);
  const participantLimits = getRetreatParticipantLimits(retreatType);
  const [count, setCount] = useState<number>(participantLimits.minParticipants);

  const priceQuote = resolveRetreatPricing(
    retreatType,
    retreatHasDurationOptions(retreatType) ? retreatDuration : undefined,
  );
  const showDurationPicker = retreatHasDurationOptions(retreatType);

  function handleRetreatTypeChange(slug: string) {
    setRetreatType(slug);
    const limits = getRetreatParticipantLimits(slug);
    handleCountChange(limits.minParticipants);
    if (retreatHasDurationOptions(slug)) {
      const type = getRetreatType(slug);
      if (type && "durationOptions" in type && type.durationOptions[0]) {
        setRetreatDuration(type.durationOptions[0].slug);
      }
    }
  }
  const [participants, setParticipants] = useState<ParticipantDraft[]>(
    Array.from({ length: participantLimits.minParticipants }, emptyParticipant),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleCountChange(next: number) {
    setCount(next);
    setParticipants((prev) => {
      if (next > prev.length) {
        return [...prev, ...Array.from({ length: next - prev.length }, emptyParticipant)];
      }
      return prev.slice(0, next);
    });
  }

  function updateParticipant<K extends keyof ParticipantDraft>(
    index: number,
    field: K,
    value: ParticipantDraft[K],
  ) {
    setParticipants((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!retreatType) {
      setError("Please choose a retreat.");
      return;
    }
    const pricing = resolveRetreatPricing(
      retreatType,
      showDurationPicker ? retreatDuration : undefined,
    );
    if (!pricing.ok) {
      setError(pricing.error);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/retreat/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          retreatTypeSlug: retreatType,
          retreatDurationSlug: pricing.durationSlug,
          participants,
        }),
      });
      const data = (await res.json()) as { bookingId?: string; error?: string };

      if (!res.ok || !data.bookingId) {
        setError(data.error ?? "Could not save registration. Please try again.");
        return;
      }

      router.push(`/retreat/booking/${data.bookingId}`);
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card mt-10 space-y-8 p-6 sm:p-8">
      <RetreatTypePicker value={retreatType} onChange={handleRetreatTypeChange} disabled={loading} />

      {showDurationPicker ? (
        <RetreatDurationPicker
          retreatTypeSlug={retreatType}
          value={retreatDuration}
          onChange={setRetreatDuration}
          disabled={loading}
        />
      ) : null}

      {priceQuote.ok ? (
        <p className="rounded-lg border border-subtle bg-[var(--surface-muted)] px-4 py-3 text-sm text-muted">
          <span className="font-medium text-[var(--foreground)]">Your retreat fee: </span>
          {formatRetreatPriceSummary(priceQuote)} (per person, all-inclusive)
        </p>
      ) : null}

      <div>
        <label htmlFor="participant-count" className="block text-sm font-semibold text-[var(--foreground)]">
          Number of participants ({participantLimits.minParticipants} to {participantLimits.maxParticipants})
        </label>
        <select
          id="participant-count"
          value={count}
          onChange={(e) => handleCountChange(Number(e.target.value))}
          className="form-control mt-2 max-w-xs"
        >
          {Array.from(
            { length: participantLimits.maxParticipants - participantLimits.minParticipants + 1 },
            (_, i) => {
            const n = participantLimits.minParticipants + i;
            return (
              <option key={n} value={n}>
                {n} people
              </option>
            );
          })}
        </select>
      </div>

      <div className="space-y-8">
        {participants.map((participant, index) => (
          <fieldset key={index} className="rounded-lg border border-subtle p-5">
            <legend className="px-1 text-sm font-semibold text-[var(--foreground)]">
              Participant {index + 1}
            </legend>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium" htmlFor={`p-${index}-name`}>
                  Full name
                </label>
                <input
                  id={`p-${index}-name`}
                  required
                  value={participant.fullName}
                  onChange={(e) => updateParticipant(index, "fullName", e.target.value)}
                  className="form-control mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium" htmlFor={`p-${index}-email`}>
                  Email
                </label>
                <input
                  id={`p-${index}-email`}
                  type="email"
                  required
                  value={participant.email}
                  onChange={(e) => updateParticipant(index, "email", e.target.value)}
                  className="form-control mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium" htmlFor={`p-${index}-phone`}>
                  Phone
                </label>
                <input
                  id={`p-${index}-phone`}
                  type="tel"
                  required
                  value={participant.phone}
                  onChange={(e) => updateParticipant(index, "phone", e.target.value)}
                  className="form-control mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium" htmlFor={`p-${index}-age`}>
                  {cfg.ageLabel}
                </label>
                <input
                  id={`p-${index}-age`}
                  type="number"
                  required
                  min={1}
                  max={120}
                  inputMode="numeric"
                  value={participant.age}
                  onChange={(e) => updateParticipant(index, "age", e.target.value)}
                  className="form-control mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium" htmlFor={`p-${index}-mobility`}>
                  {cfg.mobilityLabel}
                </label>
                <select
                  id={`p-${index}-mobility`}
                  required
                  value={participant.fitnessMobilityLevel}
                  onChange={(e) =>
                    updateParticipant(
                      index,
                      "fitnessMobilityLevel",
                      e.target.value as RetreatMobilityLevel | "",
                    )
                  }
                  className="form-control mt-1"
                >
                  <option value="" disabled>
                    Select a level
                  </option>
                  {cfg.mobilityLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium" htmlFor={`p-${index}-dietary`}>
                  {cfg.dietaryLabel}
                </label>
                <textarea
                  id={`p-${index}-dietary`}
                  required
                  rows={3}
                  placeholder={cfg.dietaryPlaceholder}
                  value={participant.dietaryRestrictionsAndAllergies}
                  onChange={(e) =>
                    updateParticipant(index, "dietaryRestrictionsAndAllergies", e.target.value)
                  }
                  className="form-control mt-1"
                />
              </div>
              <label className="flex cursor-pointer gap-3 text-sm leading-relaxed sm:col-span-2">
                <input
                  type="checkbox"
                  required
                  checked={participant.marketingConsent}
                  onChange={(e) => updateParticipant(index, "marketingConsent", e.target.checked)}
                  className="mt-1 size-5 shrink-0 accent-[var(--rasta-green)]"
                />
                <span>{cfg.marketingConsentLabel}</span>
              </label>
            </div>
          </fieldset>
        ))}
      </div>

      <button type="submit" disabled={loading} className="btn btn-primary w-full sm:w-auto">
        {loading ? "Saving…" : "Continue to payments"}
      </button>

      {error ? (
        <p className="text-sm text-[var(--rasta-red)]" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
