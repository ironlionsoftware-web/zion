"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { formatUsd } from "@/lib/cart/products";

export function ShopCartBar() {
  const { lines, itemCount, subtotalCents, hydrated } = useCart();

  if (!hydrated || itemCount === 0) return null;

  return (
    <div
      className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-subtle bg-[var(--cream)]/98 px-4 py-3 shadow-[0_-4px_24px_rgb(42_34_24_/0.08)] backdrop-blur-sm sm:px-6 sm:py-4"
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
          <p className="min-w-0 text-xs text-muted sm:max-w-md sm:truncate">
            {lines.map((line) => `${line.name} ×${line.quantity}`).join(", ")}
          </p>
        </div>
      </div>
    </div>
  );
}
