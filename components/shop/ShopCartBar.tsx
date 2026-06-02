"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { formatUsd } from "@/lib/cart/products";

export function ShopCartBar() {
  const { lines, itemCount, subtotalCents, hydrated } = useCart();

  if (!hydrated || itemCount === 0) return null;

  return (
    <div
      className="safe-bottom sticky bottom-0 z-20 -mx-4 border-t border-subtle bg-[var(--cream)]/95 px-4 py-4 backdrop-blur-sm sm:-mx-6 sm:px-6"
      role="region"
      aria-label="Cart summary"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[var(--foreground)]">
          <span className="font-semibold">{itemCount}</span> {itemCount === 1 ? "item" : "items"} in cart ·{" "}
          <span className="font-semibold">{formatUsd(subtotalCents)}</span>
          <span className="text-muted"> (excl. tax)</span>
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/shop/checkout" className="btn btn-primary">
            Checkout
          </Link>
          <p className="self-center text-xs text-muted sm:max-w-xs sm:truncate">
            {lines.map((line) => `${line.name} ×${line.quantity}`).join(", ")}
          </p>
        </div>
      </div>
    </div>
  );
}
