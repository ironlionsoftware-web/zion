"use client";

import { useCart } from "@/components/cart/CartProvider";
import { ShopCartBar } from "@/components/shop/ShopCartBar";

export function ShopPageShell({ children }: { children: React.ReactNode }) {
  const { itemCount, hydrated } = useCart();
  const cartVisible = hydrated && itemCount > 0;

  return (
    <>
      <div className={cartVisible ? "pb-36 sm:pb-32" : "pb-12"}>{children}</div>
      <ShopCartBar />
    </>
  );
}
