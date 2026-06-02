export const retreatMobilityLevels = ["high", "moderate", "limited", "minimal"] as const;

export type RetreatMobilityLevel = (typeof retreatMobilityLevels)[number];

export type RetreatParticipant = {
  fullName: string;
  email: string;
  phone: string;
  marketingConsent: boolean;
  age: number;
  dietaryRestrictionsAndAllergies: string;
  fitnessMobilityLevel: RetreatMobilityLevel;
  depositPaidAt?: string;
  balancePaidAt?: string;
  balancePaymentPlan?: "full" | "installments";
};

export type RetreatBooking = {
  id: string;
  createdAt: string;
  /** Themed retreat selected at registration (optional on legacy bookings). */
  retreatTypeSlug?: string;
  retreatTypeLabel?: string;
  /** Fitness retreat length (2 weeks or 1 month). */
  retreatDurationSlug?: string;
  retreatDurationLabel?: string;
  /** Per-participant pricing locked at registration (defaults to $2,500 / $500 deposit if omitted). */
  totalCents?: number;
  depositCents?: number;
  balanceCents?: number;
  participants: RetreatParticipant[];
};

export type RetreatPaymentType = "deposit" | "balance";
