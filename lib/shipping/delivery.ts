export const DELIVERY_FEE_CENTS = 1000;

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

const GREATER_AUSTIN_CITIES = new Set([
  "austin",
  "round rock",
  "cedar park",
  "pflugerville",
  "leander",
  "georgetown",
  "kyle",
  "buda",
  "lakeway",
  "bee cave",
  "dripping springs",
  "hutto",
  "manor",
  "del valle",
  "west lake hills",
  "rollingwood",
  "sunset valley",
  "san marcos",
  "liberty hill",
  "spicewood",
  "elgin",
  "cedar creek",
  "driftwood",
]);

/** Common Greater Austin metro ZIP codes (Travis County and surrounding suburbs). */
const GREATER_AUSTIN_ZIPS = new Set([
  "78610",
  "78612",
  "78613",
  "78615",
  "78617",
  "78620",
  "78621",
  "78626",
  "78628",
  "78633",
  "78634",
  "78640",
  "78641",
  "78642",
  "78645",
  "78652",
  "78653",
  "78660",
  "78664",
  "78665",
  "78666",
  "78669",
  "78681",
  "78691",
  ...Array.from({ length: 99 }, (_, i) => String(78701 + i).padStart(5, "0")),
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

export function isGreaterAustinArea(address: Pick<DeliveryAddress, "city" | "state" | "postalCode">): boolean {
  if (normalizeState(address.state) !== "TX") return false;
  const zip = normalizeZip(address.postalCode);
  if (zip && GREATER_AUSTIN_ZIPS.has(zip)) return true;
  const city = normalizeCity(address.city);
  return GREATER_AUSTIN_CITIES.has(city);
}

export function computeDeliveryFeeCents(address: DeliveryAddress): number {
  return isGreaterAustinArea(address) ? 0 : DELIVERY_FEE_CENTS;
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
