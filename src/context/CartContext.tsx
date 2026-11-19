"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getItem, type MenuItem } from "@/data/menu";

export interface CartLine {
  item: MenuItem;
  qty: number;
}

interface CartState {
  lines: CartLine[];
  count: number;
  subtotal: number;
  add: (id: string, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  open: boolean;
  setOpen: (v: boolean) => void;
  lastAdded: { id: string; at: number } | null;
}

const CartContext = createContext<CartState | null>(null);
const KEY = "smokehouse-cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [qtys, setQtys] = useState<Record<string, number>>({});
  const [open, setOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState<CartState["lastAdded"]>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setQtys(JSON.parse(raw));
    } catch {
      /* storage unavailable */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(qtys));
    } catch {
      /* storage unavailable */
    }
  }, [qtys, hydrated]);

  const add = useCallback((id: string, qty = 1) => {
    setQtys((q) => ({ ...q, [id]: Math.min(20, (q[id] ?? 0) + qty) }));
    setLastAdded({ id, at: Date.now() });
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setQtys((q) => {
      const next = { ...q };
      if (qty <= 0) delete next[id];
      else next[id] = Math.min(20, qty);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => setQty(id, 0), [setQty]);
  const clear = useCallback(() => setQtys({}), []);

  const value = useMemo<CartState>(() => {
    const lines: CartLine[] = Object.entries(qtys)
      .map(([id, qty]) => {
        const item = getItem(id);
        return item ? { item, qty } : null;
      })
      .filter((l): l is CartLine => l !== null);
    return {
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal: lines.reduce((n, l) => n + l.qty * l.item.price, 0),
      add,
      setQty,
      remove,
      clear,
      open,
      setOpen,
      lastAdded,
    };
  }, [qtys, add, setQty, remove, clear, open, lastAdded]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}

export const money = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

export const DELIVERY_FEE = 3.99;
export const FREE_DELIVERY_OVER = 50;
export const TAX_RATE = 0.08;
