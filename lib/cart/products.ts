import { shopProducts } from "@/content/site";
import type { CartLine, CartLineWithProduct } from "./types";

export function resolveCartLines(items: CartLine[]): CartLineWithProduct[] {
  return items
    .map((line) => {
      const product = shopProducts.find((p) => p.slug === line.slug);
      if (!product) return null;
      return {
        ...line,
        name: product.name,
        priceCents: product.priceCents,
        imageSrc: product.imageSrc,
        lineTotalCents: product.priceCents * line.quantity,
      };
    })
    .filter((line): line is CartLineWithProduct => line !== null);
}

export function cartSubtotalCents(lines: CartLineWithProduct[]): number {
  return lines.reduce((sum, line) => sum + line.lineTotalCents, 0);
}

export function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}
