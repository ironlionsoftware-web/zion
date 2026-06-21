"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { shopProducts, site, type ShopProduct, type ShopProductOptionGroup } from "@/content/site";
import { useCart } from "@/components/cart/CartProvider";
import {
  defaultOptionSelection,
  formatUsd,
  optionSelectionVariantId,
  productPriceLabel,
  resolveProductSelection,
} from "@/lib/cart/products";

function OptionGroupPicker({
  product,
  selection,
  onChange,
}: {
  product: ShopProduct;
  selection: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
}) {
  function renderGroup(group: ShopProductOptionGroup) {
    const selectedChoice = group.choices.find((choice) => choice.id === selection[group.id]);

    if (group.id === "flavor") {
      return (
        <fieldset key={group.id} className="mt-4">
          <legend className="text-sm font-semibold text-[var(--foreground)]">{group.label}</legend>
          <label className="sr-only" htmlFor={`${product.slug}-flavor`}>
            Choose a flavor
          </label>
          <select
            id={`${product.slug}-flavor`}
            value={selection[group.id] ?? ""}
            onChange={(e) => onChange({ ...selection, [group.id]: e.target.value })}
            className="form-control mt-2 w-full"
          >
            {group.choices.map((choice) => (
              <option key={choice.id} value={choice.id}>
                {choice.label}
              </option>
            ))}
          </select>
          {selectedChoice?.description ? (
            <p
              className="mt-3 rounded-sm border border-[var(--rasta-green)]/30 bg-surface-muted p-3 text-sm leading-relaxed text-[var(--foreground)]"
              role="status"
            >
              <span className="font-medium">{selectedChoice.label}:</span> {selectedChoice.description}
            </p>
          ) : null}
        </fieldset>
      );
    }

    return (
      <fieldset key={group.id} className="mt-4">
        <legend className="text-sm font-semibold text-[var(--foreground)]">{group.label}</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {group.choices.map((choice) => (
            <label
              key={choice.id}
              className={`flex cursor-pointer items-center gap-2 rounded-sm border px-3 py-2 text-sm transition has-focus-visible:ring-2 has-focus-visible:ring-[var(--rasta-gold)] has-focus-visible:ring-offset-2 ${selection[group.id] === choice.id ? "border-[var(--rasta-green)] ring-1 ring-[var(--rasta-green)]" : "border-subtle"}`}
            >
              <input
                type="radio"
                name={`${product.slug}-${group.id}`}
                value={choice.id}
                checked={selection[group.id] === choice.id}
                onChange={() => onChange({ ...selection, [group.id]: choice.id })}
                className="accent-[var(--rasta-green)]"
              />
              <span className="font-medium text-[var(--foreground)]">{choice.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  return <>{product.optionGroups!.map(renderGroup)}</>;
}

function VariantPicker({
  product,
  variantId,
  onChange,
}: {
  product: ShopProduct;
  variantId: string;
  onChange: (id: string) => void;
}) {
  return (
    <fieldset className="mt-4">
      <legend className="text-sm font-semibold text-[var(--foreground)]">Size</legend>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        {product.variants!.map((variant) => (
          <label
            key={variant.id}
            className={`flex cursor-pointer flex-col gap-1 rounded-sm border px-3 py-2 text-sm transition has-focus-visible:ring-2 has-focus-visible:ring-[var(--rasta-gold)] has-focus-visible:ring-offset-2 sm:flex-row sm:items-center sm:justify-between ${variantId === variant.id ? "border-[var(--rasta-green)] ring-1 ring-[var(--rasta-green)]" : "border-subtle"}`}
          >
            <span className="flex items-center gap-2">
              <input
                type="radio"
                name={`variant-${product.slug}`}
                value={variant.id}
                checked={variantId === variant.id}
                onChange={() => onChange(variant.id)}
                className="accent-[var(--rasta-green)]"
              />
              <span className="font-medium text-[var(--foreground)]">{variant.label}</span>
            </span>
            <span className="pl-6 text-[var(--rasta-green)] sm:pl-0">{formatUsd(variant.priceCents)}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function ProductCard({ product, hydrated }: { product: ShopProduct; hydrated: boolean }) {
  const { addItem } = useCart();
  const isFeatured = product.slug === "bottled-teas";
  const hasOptionGroups = Boolean(product.optionGroups?.length);
  const hasVariants = Boolean(product.variants?.length);
  const hasConfigurableOptions = hasOptionGroups || hasVariants;
  const [optionSelection, setOptionSelection] = useState(() => defaultOptionSelection(product));
  const [variantId, setVariantId] = useState(product.variants?.[0]?.id ?? "");
  const [justAdded, setJustAdded] = useState(false);

  const activeVariantId = useMemo(() => {
    if (hasOptionGroups) return optionSelectionVariantId(product, optionSelection);
    if (hasVariants) return variantId;
    return undefined;
  }, [hasOptionGroups, hasVariants, optionSelection, product, variantId]);

  const selection = resolveProductSelection(product, activeVariantId);
  const displayPrice = selection?.priceCents ?? product.priceCents;

  function handleAdd() {
    if (!activeVariantId && hasConfigurableOptions) return;
    addItem(product.slug, activeVariantId);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 2000);
  }

  return (
    <article
      className={`card flex h-full min-w-0 flex-col overflow-hidden ${isFeatured ? "lg:flex-row lg:items-stretch" : ""}`}
    >
      <div
        className={`relative shrink-0 bg-surface-muted ${isFeatured ? "aspect-[16/10] lg:aspect-auto lg:w-2/5 lg:min-h-[22rem]" : "aspect-[4/5]"}`}
      >
        <Image
          src={product.imageSrc}
          alt={product.imageAlt}
          fill
          sizes={
            isFeatured
              ? "(max-width: 1024px) 100vw, 40vw"
              : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          }
          className="object-cover"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-6">
        <h3 className="font-display text-xl font-medium text-[var(--foreground)]">{product.name}</h3>
        {product.description ? (
          <p className="prose-content mt-3 line-clamp-6 text-sm leading-relaxed text-muted sm:line-clamp-none">
            {product.description}
          </p>
        ) : null}

        {hasOptionGroups ? (
          <OptionGroupPicker product={product} selection={optionSelection} onChange={setOptionSelection} />
        ) : null}
        {hasVariants ? <VariantPicker product={product} variantId={variantId} onChange={setVariantId} /> : null}

        <div className="mt-auto pt-4">
          <p className="text-base font-medium text-[var(--rasta-green)]">
            {selection ? formatUsd(displayPrice ?? 0) : productPriceLabel(product)}
          </p>
          <p className="mt-1 text-xs text-muted">Excluding sales tax</p>
          <button
            type="button"
            onClick={handleAdd}
            className="btn btn-primary mt-4 w-full"
            disabled={!hydrated || (hasConfigurableOptions && !activeVariantId)}
            aria-live="polite"
          >
            {justAdded ? `${product.name} added to cart` : `Add ${product.name} to cart`}
          </button>
        </div>
      </div>
    </article>
  );
}

export function ShopCatalog() {
  const { hydrated } = useCart();

  return (
    <section aria-labelledby="shop-products-heading">
      <h2 id="shop-products-heading" className="sr-only">
        Available products
      </h2>
      <ul className="grid grid-cols-1 items-stretch gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {shopProducts.map((product) => (
          <li
            key={product.slug}
            className={`min-w-0 ${product.slug === "bottled-teas" ? "sm:col-span-2 lg:col-span-3" : ""}`}
          >
            <ProductCard product={product} hydrated={hydrated} />
          </li>
        ))}
      </ul>
      <p className="prose-content mt-10 text-sm">
        Prefer to browse on our previous storefront?{" "}
        <Link
          href="https://www.ironlionfitnessandhealing.com/shop"
          className="link-accent font-medium hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Visit the apothecary shop
          <span className="sr-only"> (opens in new tab)</span>
        </Link>
        .
      </p>
      <p className="prose-content mt-12 max-w-3xl border-t border-subtle pt-10 text-sm leading-relaxed text-muted">
        {site.shop.disclaimer}
      </p>
    </section>
  );
}
