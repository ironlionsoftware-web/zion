"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { cartSubtotalCents, cartLineKey, isValidCartLine, resolveCartLines } from "@/lib/cart/products";
import { readCartFromStorage, writeCartToStorage } from "@/lib/cart/storage";
import type { CartLine, CartLineWithProduct } from "@/lib/cart/types";

type CartContextValue = {
  lines: CartLineWithProduct[];
  itemCount: number;
  subtotalCents: number;
  hydrated: boolean;
  addItem: (slug: string, variantId?: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function normalizeItems(items: CartLine[]): CartLine[] {
  return items.filter((item) => isValidCartLine(item));
}

function lineMatchesKey(line: CartLine, key: string): boolean {
  return cartLineKey(line) === key;
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
    (slug: string, variantId?: string) => {
      const candidate: CartLine = { slug, variantId, quantity: 1 };
      if (!isValidCartLine(candidate)) return;
      const key = cartLineKey(candidate);
      setItems((prev) => {
        const existing = prev.find((line) => lineMatchesKey(line, key));
        if (existing) {
          return prev.map((line) =>
            lineMatchesKey(line, key) ? { ...line, quantity: line.quantity + 1 } : line,
          );
        }
        return [...prev, candidate];
      });
    },
    [setItems],
  );

  const setQuantity = useCallback(
    (key: string, quantity: number) => {
      if (quantity < 1) {
        setItems((prev) => prev.filter((line) => !lineMatchesKey(line, key)));
        return;
      }
      setItems((prev) =>
        prev.map((line) => (lineMatchesKey(line, key) ? { ...line, quantity } : line)),
      );
    },
    [setItems],
  );

  const removeItem = useCallback(
    (key: string) => {
      setItems((prev) => prev.filter((line) => !lineMatchesKey(line, key)));
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
