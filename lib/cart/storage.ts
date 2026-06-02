import type { CartLine } from "./types";

export const CART_STORAGE_KEY = "iron-lion-cart";

export function readCartFromStorage(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((row) => {
        if (typeof row !== "object" || row === null) return null;
        const slug = "slug" in row && typeof row.slug === "string" ? row.slug : "";
        const quantity = "quantity" in row ? Number(row.quantity) : 0;
        if (!slug || !Number.isInteger(quantity) || quantity < 1) return null;
        return { slug, quantity };
      })
      .filter((row): row is CartLine => row !== null);
  } catch {
    return [];
  }
}

export function writeCartToStorage(items: CartLine[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}
