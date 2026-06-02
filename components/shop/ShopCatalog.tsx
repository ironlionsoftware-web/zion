"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { shopProducts } from "@/content/site";
import { useCart } from "@/components/cart/CartProvider";
import { formatUsd } from "@/lib/cart/products";

export function ShopCatalog() {
  const { addItem, hydrated } = useCart();
  const [addedSlug, setAddedSlug] = useState<string | null>(null);

  function handleAdd(slug: string) {
    addItem(slug);
    setAddedSlug(slug);
    window.setTimeout(() => setAddedSlug((current) => (current === slug ? null : current)), 2000);
  }

  return (
    <section aria-labelledby="shop-products-heading">
      <h2 id="shop-products-heading" className="sr-only">
        Available products
      </h2>
      <ul className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {shopProducts.map((product) => (
          <li key={product.slug}>
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
                <p className="mt-2 text-base font-medium text-[var(--rasta-green)]">{formatUsd(product.priceCents)}</p>
                <p className="mt-1 text-xs text-muted">Excluding sales tax</p>
                <button
                  type="button"
                  onClick={() => handleAdd(product.slug)}
                  className="btn btn-primary mt-6 w-full"
                  disabled={!hydrated}
                  aria-live="polite"
                >
                  {addedSlug === product.slug ? `${product.name} added to cart` : `Add ${product.name} to cart`}
                </button>
              </div>
            </article>
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
