"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { formatUsd } from "@/lib/cart/products";

export function ShopCartBar() {
  const { lines, itemCount, subtotalCents, hydrated } = useCart();

  if (!hydrated || itemCount === 0) return null;

  return (
    <div
      className="safe-bottom sticky bottom-0 z-20 -mx-4 border-t border-subtle bg-[var(--cream)] px-4 py-3 max-lg:bg-[var(--cream)] sm:-mx-6 sm:px-6 sm:py-4 lg:bg-[var(--cream)]/95 lg:backdrop-blur-sm"
      role="region"
      aria-label="Cart summary"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed text-[var(--foreground)]">
          <span className="font-semibold">{itemCount}</span> {itemCount === 1 ? "item" : "items"} in cart ·{" "}
          <span className="font-semibold">{formatUsd(subtotalCents)}</span>
          <span className="text-muted"> (excl. tax)</span>
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          <Link href="/shop/checkout" className="btn btn-primary w-full touch-manipulation sm:w-auto">
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
