import {
  shopProducts,
  type ShopProduct,
  type ShopProductOptionGroup,
  type ShopProductVariant,
} from "@/content/site";
import type { CartLine, CartLineWithProduct } from "./types";

export const OPTION_VARIANT_SEPARATOR = "|";

export function buildOptionVariantId(groupIds: readonly string[]): string {
  return groupIds.join(OPTION_VARIANT_SEPARATOR);
}

export function parseOptionVariantId(variantId: string, groupCount: number): string[] | null {
  const parts = variantId.split(OPTION_VARIANT_SEPARATOR);
  if (parts.length !== groupCount) return null;
  return parts;
}

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

export function productHasConfigurableOptions(product: ShopProduct): boolean {
  return Boolean(product.variants?.length || product.optionGroups?.length);
}

function getVariant(product: ShopProduct, variantId: string): ShopProductVariant | undefined {
  return product.variants?.find((v) => v.id === variantId);
}

function resolveOptionSelection(
  groups: ShopProductOptionGroup[],
  optionPrices: Record<string, number>,
  variantId: string,
): { labels: string[]; priceCents: number } | null {
  const parts = parseOptionVariantId(variantId, groups.length);
  if (!parts) return null;
  const labels: string[] = [];
  for (let i = 0; i < groups.length; i++) {
    const choice = groups[i].choices.find((c) => c.id === parts[i]);
    if (!choice) return null;
    labels.push(choice.label);
  }
  const priceCents = optionPrices[variantId];
  if (priceCents == null) return null;
  return { labels, priceCents };
}

export function resolveProductSelection(
  product: ShopProduct,
  variantId?: string,
): { name: string; priceCents: number } | null {
  if (product.optionGroups?.length && product.optionPrices && variantId) {
    const resolved = resolveOptionSelection(product.optionGroups, product.optionPrices, variantId);
    if (!resolved) return null;
    return {
      name: `${product.name} (${resolved.labels.join(" · ")})`,
      priceCents: resolved.priceCents,
    };
  }

  if (product.variants?.length && variantId) {
    const variant = getVariant(product, variantId);
    if (!variant) return null;
    return {
      name: `${product.name} (${variant.label})`,
      priceCents: variant.priceCents,
    };
  }

  if (!variantId && product.priceCents != null) {
    return { name: product.name, priceCents: product.priceCents };
  }

  return null;
}

export function isValidCartLine(line: CartLine): boolean {
  const product = getShopProduct(line.slug);
  if (!product || line.quantity < 1) return false;
  if (productHasConfigurableOptions(product)) {
    return Boolean(line.variantId && resolveProductSelection(product, line.variantId));
  }
  return !line.variantId && product.priceCents != null;
}

export function resolveCartLines(items: CartLine[]): CartLineWithProduct[] {
  return items
    .map((line) => {
      if (!isValidCartLine(line)) return null;
      const product = getShopProduct(line.slug)!;
      const selection = resolveProductSelection(product, line.variantId);
      if (!selection) return null;
      return {
        ...line,
        key: cartLineKey(line),
        name: selection.name,
        priceCents: selection.priceCents,
        imageSrc: product.imageSrc,
        lineTotalCents: selection.priceCents * line.quantity,
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

export function defaultOptionSelection(product: ShopProduct): Record<string, string> {
  if (!product.optionGroups?.length) return {};
  return Object.fromEntries(
    product.optionGroups.map((group) => [group.id, group.choices[0]?.id ?? ""]),
  );
}

export function optionSelectionVariantId(
  product: ShopProduct,
  selection: Record<string, string>,
): string | undefined {
  if (!product.optionGroups?.length) return undefined;
  const ids = product.optionGroups.map((group) => selection[group.id]?.trim()).filter(Boolean);
  if (ids.length !== product.optionGroups.length) return undefined;
  return buildOptionVariantId(ids);
}

export function productPriceLabel(product: ShopProduct): string {
  if (product.optionPrices) {
    const prices = Object.values(product.optionPrices);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? formatUsd(min) : `From ${formatUsd(min)}`;
  }
  if (product.variants?.length) {
    const prices = product.variants.map((v) => v.priceCents);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? formatUsd(min) : `From ${formatUsd(min)}`;
  }
  return formatUsd(product.priceCents ?? 0);
}
