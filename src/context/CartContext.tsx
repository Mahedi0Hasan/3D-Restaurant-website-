"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getItem, type MenuItem } from "@/data/menu";
import { findPromo, type Promo } from "@/lib/promos";

export interface CartLine {
  item: MenuItem;
  qty: number;
}

export type OrderMode = "delivery" | "pickup";

export interface Pricing {
  subtotal: number;
  discount: number;
  delivery: number;
  tax: number;
  total: number;
  /** Coupon is applied but the subtotal is below its minimum. */
  couponPending: boolean;
  /** Amount still needed to unlock the applied coupon. */
  couponShortfall: number;
  /** Amount still needed for free delivery (0 when unlocked or pickup). */
  freeDeliveryShortfall: number;
}

export type CouponResult =
  | { ok: true; promo: Promo; message: string }
  | { ok: false; message: string };

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
  mode: OrderMode;
  setMode: (m: OrderMode) => void;
  coupon: Promo | null;
  applyCoupon: (code: string) => CouponResult;
  removeCoupon: () => void;
  pricing: Pricing;
}

const CartContext = createContext<CartState | null>(null);
const KEY = "smokehouse-cart-v1";
const COUPON_KEY = "smokehouse-coupon-v1";
const MAX_QTY = 20;

export const money = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

export const DELIVERY_FEE = 3.99;
export const FREE_DELIVERY_OVER = 50;
export const TAX_RATE = 0.08;

const round2 = (n: number) => Math.round(n * 100) / 100;

export function computePricing(subtotal: number, coupon: Promo | null, mode: OrderMode): Pricing {
  const couponActive = !!coupon && subtotal > 0 && subtotal >= coupon.minSubtotal;
  const discount = couponActive ? round2(subtotal * (coupon!.percent / 100)) : 0;
  const afterDiscount = subtotal - discount;
  const freeDeliveryShortfall =
    mode === "delivery" && subtotal > 0 ? Math.max(0, round2(FREE_DELIVERY_OVER - afterDiscount)) : 0;
  const delivery = mode === "delivery" && subtotal > 0 && freeDeliveryShortfall > 0 ? DELIVERY_FEE : 0;
  const tax = round2(afterDiscount * TAX_RATE);
  return {
    subtotal: round2(subtotal),
    discount,
    delivery,
    tax,
    total: round2(afterDiscount + delivery + tax),
    couponPending: !!coupon && !couponActive,
    couponShortfall: coupon && !couponActive ? round2(Math.max(0, coupon.minSubtotal - subtotal)) : 0,
    freeDeliveryShortfall,
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [qtys, setQtys] = useState<Record<string, number>>({});
  const [open, setOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState<CartState["lastAdded"]>(null);
  const [hydrated, setHydrated] = useState(false);
  const [mode, setMode] = useState<OrderMode>("delivery");
  const [coupon, setCoupon] = useState<Promo | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, number>;
        // drop unknown ids / bad values from older versions
        const clean: Record<string, number> = {};
        for (const [id, q] of Object.entries(parsed)) {
          if (getItem(id) && Number.isFinite(q) && q > 0) clean[id] = Math.min(MAX_QTY, Math.floor(q));
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setQtys(clean);
      }
      const code = localStorage.getItem(COUPON_KEY);
      if (code) setCoupon(findPromo(code) ?? null);
    } catch {
      /* storage unavailable */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(qtys));
      if (coupon) localStorage.setItem(COUPON_KEY, coupon.code);
      else localStorage.removeItem(COUPON_KEY);
    } catch {
      /* storage unavailable */
    }
  }, [qtys, coupon, hydrated]);

  const add = useCallback((id: string, qty = 1) => {
    setQtys((q) => ({ ...q, [id]: Math.min(MAX_QTY, (q[id] ?? 0) + qty) }));
    setLastAdded({ id, at: Date.now() });
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setQtys((q) => {
      const next = { ...q };
      if (qty <= 0) delete next[id];
      else next[id] = Math.min(MAX_QTY, qty);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => setQty(id, 0), [setQty]);
  const clear = useCallback(() => {
    setQtys({});
    setCoupon(null);
  }, []);

  const lines = useMemo(
    () =>
      Object.entries(qtys)
        .map(([id, qty]) => {
          const item = getItem(id);
          return item ? { item, qty } : null;
        })
        .filter((l): l is CartLine => l !== null),
    [qtys]
  );
  const subtotal = useMemo(() => lines.reduce((n, l) => n + l.qty * l.item.price, 0), [lines]);

  const applyCoupon = useCallback(
    (code: string): CouponResult => {
      const trimmed = code.trim();
      if (!trimmed) return { ok: false, message: "Enter a promo code first." };
      const promo = findPromo(trimmed);
      if (!promo) return { ok: false, message: `“${trimmed.toUpperCase()}” isn't a valid code.` };
      setCoupon(promo);
      const short = promo.minSubtotal - subtotal;
      return {
        ok: true,
        promo,
        message:
          short > 0
            ? `${promo.code} saved — add ${money(short)} more to unlock ${promo.percent}% off.`
            : `${promo.code} applied — ${promo.percent}% off your order.`,
      };
    },
    [subtotal]
  );

  const removeCoupon = useCallback(() => setCoupon(null), []);

  const value = useMemo<CartState>(
    () => ({
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal,
      add,
      setQty,
      remove,
      clear,
      open,
      setOpen,
      lastAdded,
      mode,
      setMode,
      coupon,
      applyCoupon,
      removeCoupon,
      pricing: computePricing(subtotal, coupon, mode),
    }),
    [lines, subtotal, add, setQty, remove, clear, open, lastAdded, mode, coupon, applyCoupon, removeCoupon]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
