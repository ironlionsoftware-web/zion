"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { shopProducts } from "@/content/site";
import { cartSubtotalCents, resolveCartLines } from "@/lib/cart/products";
import { readCartFromStorage, writeCartToStorage } from "@/lib/cart/storage";
import type { CartLine, CartLineWithProduct } from "@/lib/cart/types";

type CartContextValue = {
  lines: CartLineWithProduct[];
  itemCount: number;
  subtotalCents: number;
  hydrated: boolean;
  addItem: (slug: string) => void;
  setQuantity: (slug: string, quantity: number) => void;
  removeItem: (slug: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function normalizeItems(items: CartLine[]): CartLine[] {
  const validSlugs = new Set(shopProducts.map((p) => p.slug));
  return items.filter((item) => validSlugs.has(item.slug) && item.quantity > 0);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [rawItems, setRawItems] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setRawItems(normalizeItems(readCartFromStorage()));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeCartToStorage(rawItems);
  }, [rawItems, hydrated]);

  const setItems = useCallback((updater: (prev: CartLine[]) => CartLine[]) => {
    setRawItems((prev) => normalizeItems(updater(prev)));
  }, []);

  const addItem = useCallback(
    (slug: string) => {
      if (!shopProducts.some((p) => p.slug === slug)) return;
      setItems((prev) => {
        const existing = prev.find((line) => line.slug === slug);
        if (existing) {
          return prev.map((line) =>
            line.slug === slug ? { ...line, quantity: line.quantity + 1 } : line,
          );
        }
        return [...prev, { slug, quantity: 1 }];
      });
    },
    [setItems],
  );

  const setQuantity = useCallback(
    (slug: string, quantity: number) => {
      if (quantity < 1) {
        setItems((prev) => prev.filter((line) => line.slug !== slug));
        return;
      }
      setItems((prev) =>
        prev.map((line) => (line.slug === slug ? { ...line, quantity } : line)),
      );
    },
    [setItems],
  );

  const removeItem = useCallback(
    (slug: string) => {
      setItems((prev) => prev.filter((line) => line.slug !== slug));
    },
    [setItems],
  );

  const clearCart = useCallback(() => setItems(() => []), [setItems]);

  const lines = useMemo(() => resolveCartLines(rawItems), [rawItems]);
  const itemCount = useMemo(() => lines.reduce((n, line) => n + line.quantity, 0), [lines]);
  const subtotalCents = useMemo(() => cartSubtotalCents(lines), [lines]);

  const value = useMemo(
    () => ({
      lines,
      itemCount,
      subtotalCents,
      hydrated,
      addItem,
      setQuantity,
      removeItem,
      clearCart,
    }),
    [lines, itemCount, subtotalCents, hydrated, addItem, setQuantity, removeItem, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
