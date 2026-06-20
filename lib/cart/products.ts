import { shopProducts, type ShopProduct, type ShopProductVariant } from "@/content/site";
import type { CartLine, CartLineWithProduct } from "./types";

export function cartLineKey(line: Pick<CartLine, "slug" | "variantId">): string {
  return line.variantId ? `${line.slug}:${line.variantId}` : line.slug;
}

export function parseCartLineId(id: string): Pick<CartLine, "slug" | "variantId"> {
  const colon = id.indexOf(":");
  if (colon === -1) return { slug: id };
  return { slug: id.slice(0, colon), variantId: id.slice(colon + 1) };
}

export function getShopProduct(slug: string): ShopProduct | undefined {
  return shopProducts.find((p) => p.slug === slug);
}

function getVariant(product: ShopProduct, variantId: string): ShopProductVariant | undefined {
  return product.variants?.find((v) => v.id === variantId);
}

export function isValidCartLine(line: CartLine): boolean {
  const product = getShopProduct(line.slug);
  if (!product || line.quantity < 1) return false;
  if (product.variants?.length) {
    return Boolean(line.variantId && getVariant(product, line.variantId));
  }
  return !line.variantId && product.priceCents != null;
}

export function resolveCartLines(items: CartLine[]): CartLineWithProduct[] {
  return items
    .map((line) => {
      if (!isValidCartLine(line)) return null;
      const product = getShopProduct(line.slug)!;
      const variant = line.variantId ? getVariant(product, line.variantId) : undefined;
      const priceCents = variant?.priceCents ?? product.priceCents;
      if (priceCents == null) return null;
      const name = variant ? `${product.name} (${variant.label})` : product.name;
      return {
        ...line,
        key: cartLineKey(line),
        name,
        priceCents,
        imageSrc: product.imageSrc,
        lineTotalCents: priceCents * line.quantity,
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

export function formatCartMetaLine(line: CartLine): string {
  return `${cartLineKey(line)}x${line.quantity}`;
}

export function parseCartMetaLine(part: string): CartLine | null {
  const match = part.match(/^(.+)x(\d+)$/);
  if (!match) return null;
  const quantity = Number(match[2]);
  if (!Number.isInteger(quantity) || quantity < 1) return null;
  return { ...parseCartLineId(match[1]), quantity };
}
