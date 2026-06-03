import { site } from "@/content/site";
import { validateRegistrationInput } from "@/lib/registration/validate";
import { retreatDisplayLabel } from "./pricing";
import { getRetreatType, parseRetreatTypeSlug, getRetreatParticipantLimits } from "./retreat-types";
import type { RetreatBooking, RetreatMobilityLevel, RetreatParticipant } from "./types";
import { retreatMobilityLevels } from "./types";

export function retreatPricing() {
  return site.retreat.booking;
}

export function formatRetreatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export function mobilityLevelLabel(level: RetreatMobilityLevel): string {
  const match = site.retreat.booking.mobilityLevels.find((m) => m.value === level);
  return match?.label ?? level;
}

export function retreatTypeLabelForBooking(booking: RetreatBooking): string {
  return retreatDisplayLabel(booking);
}

export function validateRetreatTypeSlug(
  slug: unknown,
): { ok: true; slug: string; label: string } | { ok: false; error: string } {
  const parsed = parseRetreatTypeSlug(typeof slug === "string" ? slug : undefined);
  if (!parsed) {
    return { ok: false, error: "Please choose a retreat." };
  }
  const type = getRetreatType(parsed)!;
  return { ok: true, slug: type.slug, label: type.label };
}

function validateParticipantHealth(
  row: Record<string, unknown>,
  index: number,
):
  | {
      ok: true;
      age: number;
      dietaryRestrictionsAndAllergies: string;
      fitnessMobilityLevel: RetreatMobilityLevel;
    }
  | { ok: false; error: string } {
  const label = `Participant ${index + 1}`;

  const ageRaw = row.age;
  const age =
    typeof ageRaw === "number"
      ? ageRaw
      : typeof ageRaw === "string" && ageRaw.trim()
        ? Number.parseInt(ageRaw.trim(), 10)
        : Number.NaN;

  if (!Number.isInteger(age) || age < 1 || age > 120) {
    return { ok: false, error: `${label}: enter a valid age (1 to 120).` };
  }

  const dietary =
    typeof row.dietaryRestrictionsAndAllergies === "string"
      ? row.dietaryRestrictionsAndAllergies.trim()
      : "";
  if (!dietary) {
    return {
      ok: false,
      error: `${label}: list dietary restrictions and allergies, or write “None”.`,
    };
  }
  if (dietary.length > 2000) {
    return { ok: false, error: `${label}: dietary notes must be under 2000 characters.` };
  }

  const mobility = row.fitnessMobilityLevel;
  if (
    typeof mobility !== "string" ||
    !(retreatMobilityLevels as readonly string[]).includes(mobility)
  ) {
    return { ok: false, error: `${label}: select a fitness / mobility level.` };
  }

  return {
    ok: true,
    age,
    dietaryRestrictionsAndAllergies: dietary,
    fitnessMobilityLevel: mobility as RetreatMobilityLevel,
  };
}

export function validateParticipantsInput(
  participants: unknown,
  retreatTypeSlug?: string,
): { ok: true; participants: RetreatParticipant[] } | { ok: false; error: string } {
  const { minParticipants, maxParticipants } = retreatTypeSlug
    ? getRetreatParticipantLimits(retreatTypeSlug)
    : retreatPricing();

  if (!Array.isArray(participants)) {
    return { ok: false, error: "Participant list is required." };
  }

  if (participants.length < minParticipants || participants.length > maxParticipants) {
    return {
      ok: false,
      error: `Retreat bookings require ${minParticipants} to ${maxParticipants} participants.`,
    };
  }

  const parsed: RetreatParticipant[] = [];
  const emails = new Set<string>();

  for (let i = 0; i < participants.length; i++) {
    const row = participants[i];
    if (typeof row !== "object" || row === null) {
      return { ok: false, error: `Participant ${i + 1} is invalid.` };
    }

    const validated = validateRegistrationInput({
      fullName: "fullName" in row ? row.fullName : "",
      email: "email" in row ? row.email : "",
      phone: "phone" in row ? row.phone : "",
      marketingConsent: "marketingConsent" in row ? row.marketingConsent : false,
    });

    if (!validated.ok) {
      return { ok: false, error: `Participant ${i + 1}: ${validated.error}` };
    }

    const health = validateParticipantHealth(row as Record<string, unknown>, i);
    if (!health.ok) {
      return { ok: false, error: health.error };
    }

    if (emails.has(validated.email)) {
      return { ok: false, error: "Each participant must use a unique email address." };
    }
    emails.add(validated.email);

    parsed.push({
      fullName: validated.fullName,
      email: validated.email,
      phone: validated.phone,
      marketingConsent: validated.marketingConsent,
      age: health.age,
      dietaryRestrictionsAndAllergies: health.dietaryRestrictionsAndAllergies,
      fitnessMobilityLevel: health.fitnessMobilityLevel,
    });
  }

  return { ok: true, participants: parsed };
}

export function balanceDueWindow(depositPaidAt: string): {
  opensAt: Date;
  dueBy: Date;
  isOpen: boolean;
  isOverdue: boolean;
  daysUntilOpen: number;
  daysUntilDue: number;
} {
  const { balanceDueMinWeeks, balanceDueMaxWeeks } = retreatPricing();
  const depositDate = new Date(depositPaidAt);
  const opensAt = new Date(depositDate);
  opensAt.setDate(opensAt.getDate() + balanceDueMinWeeks * 7);
  const dueBy = new Date(depositDate);
  dueBy.setDate(dueBy.getDate() + balanceDueMaxWeeks * 7);
  const now = new Date();

  const msDay = 24 * 60 * 60 * 1000;
  const daysUntilOpen = Math.ceil((opensAt.getTime() - now.getTime()) / msDay);
  const daysUntilDue = Math.ceil((dueBy.getTime() - now.getTime()) / msDay);

  return {
    opensAt,
    dueBy,
    isOpen: now >= opensAt && now <= dueBy,
    isOverdue: now > dueBy,
    daysUntilOpen,
    daysUntilDue,
  };
}

export function participantMatchesRegistration(
  participant: RetreatParticipant,
  registration: { email: string },
): boolean {
  return participant.email.toLowerCase() === registration.email.toLowerCase();
}
