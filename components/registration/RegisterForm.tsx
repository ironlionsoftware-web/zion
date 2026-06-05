"use client";

import { useState } from "react";
import { PractitionerPicker } from "@/components/booking/PractitionerPicker";
import { CeremonyMedicinePicker } from "@/components/booking/CeremonyMedicinePicker";
import { ReikiAddOnPicker } from "@/components/booking/ReikiAddOnPicker";
import { site } from "@/content/site";
import { isClassService } from "@/lib/booking/classes";
import {
  getCeremonyMedicineOptions,
  isPlantMedicineCeremonyService,
} from "@/lib/booking/ceremony-medicine";
import { isReikiService } from "@/lib/booking/reiki-addon";
import { getBookableService } from "@/content/site";
import { isFitnessOnlyPractitionerSlug } from "@/lib/booking/fitness-trainers";
import { getPractitioners } from "@/lib/booking/practitioners";
import type { RegisterNext } from "@/lib/registration/types";

type RegisterFormProps = {
  next: RegisterNext;
  service?: string;
  bookingId?: string;
  participantIndex?: number;
  source?: string;
  initialPractitioner?: string;
  initialCeremonyMedicine?: string;
  initialReikiAddOns?: readonly string[];
};

export function RegisterForm({
  next,
  service,
  bookingId,
  participantIndex,
  source = "register",
  initialPractitioner,
  initialCeremonyMedicine,
  initialReikiAddOns,
}: RegisterFormProps) {
  const fitnessTrainerPreselected =
    Boolean(initialPractitioner) && isFitnessOnlyPractitionerSlug(initialPractitioner) && !service;
  const showPractitionerPicker =
    next === "book" && !isClassService(service) && !fitnessTrainerPreselected;
  const servicePriceCents = service ? getBookableService(service)?.priceCents : undefined;
  const showCeremonyPicker = isPlantMedicineCeremonyService(service);
  const showReikiAddOnPicker = isReikiService(service);
  const ceremonyOptions = getCeremonyMedicineOptions();
  const [practitioner, setPractitioner] = useState<string>(
    initialPractitioner ?? getPractitioners()[0]?.slug ?? "",
  );
  const [ceremonyMedicine, setCeremonyMedicine] = useState<string>(
    initialCeremonyMedicine ?? ceremonyOptions[0]?.slug ?? "",
  );
  const [reikiAddOns, setReikiAddOns] = useState<string[]>([...(initialReikiAddOns ?? [])]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (showPractitionerPicker && !practitioner) {
      setError("Please choose a practitioner.");
      return;
    }
    if (showCeremonyPicker && !ceremonyMedicine) {
      setError("Please choose a ceremony option.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          marketingConsent,
          next,
          service,
          practitioner:
            showPractitionerPicker || fitnessTrainerPreselected ? practitioner : undefined,
          ceremonyMedicine: showCeremonyPicker ? ceremonyMedicine : undefined,
          reikiAddOns: showReikiAddOnPicker && reikiAddOns.length > 0 ? reikiAddOns : undefined,
          booking: bookingId,
          participant: participantIndex,
          source: source ?? (service ? "healing-services" : "register"),
        }),
      });
      const data = (await res.json()) as { redirect?: string; external?: boolean; error?: string };

      if (!res.ok || !data.redirect) {
        setError(data.error ?? "Registration failed. Please try again.");
        return;
      }

      if (data.external) {
        window.location.href = data.redirect;
      } else {
        window.location.assign(data.redirect);
      }
    } catch {
      setError("Could not submit registration. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card mt-10 max-w-lg p-6 sm:p-8">
      {showCeremonyPicker ? (
        <CeremonyMedicinePicker value={ceremonyMedicine} onChange={setCeremonyMedicine} disabled={loading} />
      ) : null}
      {showReikiAddOnPicker ? (
        <ReikiAddOnPicker value={reikiAddOns} onChange={setReikiAddOns} disabled={loading} />
      ) : null}
      {showPractitionerPicker ? (
        <PractitionerPicker
          value={practitioner}
          onChange={setPractitioner}
          disabled={loading}
          basePriceCents={servicePriceCents}
        />
      ) : null}
      <div
        className={
          showPractitionerPicker || showCeremonyPicker || showReikiAddOnPicker
            ? "mt-8 space-y-5"
            : "space-y-5"
        }
      >
        <div>
          <label htmlFor="reg-name" className="block text-sm font-semibold text-[var(--foreground)]">
            Full name <span className="text-[var(--rasta-red)]">*</span>
          </label>
          <input
            id="reg-name"
            name="fullName"
            type="text"
            autoComplete="name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="form-control mt-2"
          />
        </div>
        <div>
          <label htmlFor="reg-email" className="block text-sm font-semibold text-[var(--foreground)]">
            Email <span className="text-[var(--rasta-red)]">*</span>
          </label>
          <input
            id="reg-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-control mt-2"
          />
        </div>
        <div>
          <label htmlFor="reg-phone" className="block text-sm font-semibold text-[var(--foreground)]">
            Phone number <span className="text-[var(--rasta-red)]">*</span>
          </label>
          <input
            id="reg-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="form-control mt-2"
          />
        </div>
        <label className="flex cursor-pointer gap-3 text-sm leading-relaxed text-[var(--foreground)]">
          <input
            type="checkbox"
            checked={marketingConsent}
            onChange={(e) => setMarketingConsent(e.target.checked)}
            required
            className="mt-1 size-5 shrink-0 accent-[var(--rasta-green)]"
          />
          <span>{site.registration.marketingConsentLabel}</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary mt-8 w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Saving…" : site.registration.submitLabel}
      </button>

      {error ? (
        <p className="mt-4 text-sm text-[var(--rasta-red)]" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
