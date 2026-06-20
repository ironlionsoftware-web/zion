"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { shopProducts, type ShopProduct } from "@/content/site";
import { useCart } from "@/components/cart/CartProvider";
import { formatUsd } from "@/lib/cart/products";

function productPriceLabel(product: ShopProduct): string {
  if (product.variants?.length) {
    const prices = product.variants.map((v) => v.priceCents);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? formatUsd(min) : `From ${formatUsd(min)}`;
  }
  return formatUsd(product.priceCents ?? 0);
}

function ProductCard({ product, hydrated }: { product: ShopProduct; hydrated: boolean }) {
  const { addItem } = useCart();
  const hasVariants = Boolean(product.variants?.length);
  const [variantId, setVariantId] = useState(product.variants?.[0]?.id ?? "");
  const [justAdded, setJustAdded] = useState(false);

  const selectedVariant = product.variants?.find((v) => v.id === variantId);
  const displayPrice = selectedVariant?.priceCents ?? product.priceCents;

  function handleAdd() {
    addItem(product.slug, hasVariants ? variantId : undefined);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 2000);
  }

  return (
    <article className="card flex h-full flex-col overflow-hidden">
      <div className="relative aspect-[4/5] bg-surface-muted">
        <Image
          src={product.imageSrc}
          alt={product.imageAlt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-xl font-medium text-[var(--foreground)]">{product.name}</h3>
        <p className="mt-2 text-base font-medium text-[var(--rasta-green)]">
          {hasVariants && selectedVariant ? formatUsd(displayPrice ?? 0) : productPriceLabel(product)}
        </p>
        <p className="mt-1 text-xs text-muted">Excluding sales tax</p>

        {hasVariants ? (
          <fieldset className="mt-4">
            <legend className="text-sm font-semibold text-[var(--foreground)]">Size</legend>
            <div className="mt-2 grid gap-2">
              {product.variants!.map((variant) => (
                <label
                  key={variant.id}
                  className={`flex cursor-pointer items-center justify-between rounded-sm border px-3 py-2 text-sm transition has-focus-visible:ring-2 has-focus-visible:ring-[var(--rasta-gold)] has-focus-visible:ring-offset-2 ${variantId === variant.id ? "border-[var(--rasta-green)] ring-1 ring-[var(--rasta-green)]" : "border-subtle"}`}
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`variant-${product.slug}`}
                      value={variant.id}
                      checked={variantId === variant.id}
                      onChange={() => setVariantId(variant.id)}
                      className="accent-[var(--rasta-green)]"
                    />
                    <span className="font-medium text-[var(--foreground)]">{variant.label}</span>
                  </span>
                  <span className="text-[var(--rasta-green)]">{formatUsd(variant.priceCents)}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}

        <button
          type="button"
          onClick={handleAdd}
          className="btn btn-primary mt-6 w-full"
          disabled={!hydrated || (hasVariants && !variantId)}
          aria-live="polite"
        >
          {justAdded ? `${product.name} added to cart` : `Add ${product.name} to cart`}
        </button>
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
      <ul className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {shopProducts.map((product) => (
          <li key={product.slug}>
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
    </section>
  );
}
