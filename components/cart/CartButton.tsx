"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

export function CartButton() {
  const { itemCount, hydrated } = useCart();

  return (
    <Link
      href={itemCount > 0 ? "/shop/checkout" : "/shop"}
      className="relative inline-flex shrink-0 min-h-11 min-w-11 touch-manipulation items-center justify-center rounded-sm px-2 text-sm font-medium text-earth outline-none transition hover:text-[var(--rasta-green)] focus-visible:ring-2 focus-visible:ring-[var(--rasta-gold)] focus-visible:ring-offset-2 motion-reduce:transition-none"
      aria-label={itemCount > 0 ? `Cart, ${itemCount} items` : "Cart, empty"}
    >
      <span aria-hidden="true" className="text-lg">
        🛒
      </span>
      {hydrated && itemCount > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--rasta-red)] px-1 text-[10px] font-bold text-white">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      ) : null}
    </Link>
  );
}
