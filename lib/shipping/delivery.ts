import { site } from "@/content/site";

export const DELIVERY_FEE_CENTS = site.delivery.feeCents;

export type DeliveryAddress = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
};

export type DeliveryAddressInput = {
  line1?: unknown;
  line2?: unknown;
  city?: unknown;
  state?: unknown;
  postalCode?: unknown;
};

const LOCAL_CITIES = new Set(site.delivery.cities.map((c) => c.toLowerCase()));

const LOCAL_ZIPS = new Set<string>([
  ...site.delivery.zips,
  ...site.delivery.zipRanges.flatMap(({ from, to }) =>
    Array.from({ length: to - from + 1 }, (_, i) => String(from + i).padStart(5, "0")),
  ),
]);

function normalizeCity(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeState(value: string): string {
  return value.trim().toUpperCase().slice(0, 2);
}

function normalizeZip(value: string): string {
  const digits = value.replace(/\D/g, "");
  return digits.slice(0, 5);
}

/** True when the address falls in the practice's free-delivery area. */
export function isLocalDeliveryArea(
  address: Pick<DeliveryAddress, "city" | "state" | "postalCode">,
): boolean {
  if (normalizeState(address.state) !== site.delivery.state) return false;
  const zip = normalizeZip(address.postalCode);
  if (zip && LOCAL_ZIPS.has(zip)) return true;
  return LOCAL_CITIES.has(normalizeCity(address.city));
}

export function computeDeliveryFeeCents(address: DeliveryAddress): number {
  return isLocalDeliveryArea(address) ? 0 : DELIVERY_FEE_CENTS;
}

export function parseDeliveryAddress(input: DeliveryAddressInput): DeliveryAddress | null {
  const line1 = typeof input.line1 === "string" ? input.line1.trim() : "";
  const line2 = typeof input.line2 === "string" ? input.line2.trim() : "";
  const city = typeof input.city === "string" ? input.city.trim() : "";
  const state = typeof input.state === "string" ? normalizeState(input.state) : "";
  const postalCode = typeof input.postalCode === "string" ? normalizeZip(input.postalCode) : "";

  if (line1.length < 3) return null;
  if (city.length < 2) return null;
  if (!/^[A-Z]{2}$/.test(state)) return null;
  if (!/^\d{5}$/.test(postalCode)) return null;

  return {
    line1,
    line2: line2 || undefined,
    city,
    state,
    postalCode,
  };
}

export function formatDeliveryAddress(address: DeliveryAddress): string {
  const parts = [
    address.line1,
    address.line2,
    `${address.city}, ${address.state} ${address.postalCode}`,
  ].filter(Boolean);
  return parts.join("\n");
}

export function formatDeliveryAddressInline(address: DeliveryAddress): string {
  return formatDeliveryAddress(address).replace(/\n/g, ", ");
}

export function isDeliveryAddressComplete(input: DeliveryAddressInput): boolean {
  return parseDeliveryAddress(input) !== null;
}
