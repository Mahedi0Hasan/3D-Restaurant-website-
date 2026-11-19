"use client";

import { useEffect, useState } from "react";
import { FREE_DELIVERY_OVER, money, useCart } from "@/context/CartContext";
import { getItem } from "@/data/menu";
import { getLenis, scrollToId } from "@/lib/scroll";
import SmartImage from "./ui/SmartImage";

export default function CartDrawer() {
  const { open, setOpen, lines, subtotal, setQty, remove, count, lastAdded } = useCart();
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const l = getLenis();
    if (open) l?.stop();
    else l?.start();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  useEffect(() => {
    if (!lastAdded) return;
    const name = getItem(lastAdded.id)?.name;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToast(name ? `${name} added to your order` : null);
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [lastAdded]);

  const progress = Math.min(1, subtotal / FREE_DELIVERY_OVER);

  return (
    <>
      {/* Toast */}
      <div
        role="status"
        aria-live="polite"
        className={`fixed bottom-6 left-1/2 z-[65] -translate-x-1/2 transition-all duration-500 ${
          toast && !open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
        }`}
      >
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-3 whitespace-nowrap rounded-full border border-gold/30 bg-coal/95 py-2.5 pl-3 pr-5 text-sm shadow-2xl backdrop-blur"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ember text-xs font-bold text-ink">✓</span>
          {toast}
          <span className="text-xs font-bold uppercase tracking-wider text-ember">View</span>
        </button>
      </div>

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-[60] bg-ink/70 backdrop-blur-sm transition-opacity duration-500 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Your cart"
        aria-hidden={!open}
        inert={!open}
        className={`fixed bottom-0 right-0 top-0 z-[61] flex w-full max-w-md flex-col border-l border-cream/10 bg-coal transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-cream/10 p-6">
          <h2 className="font-display text-2xl font-light">
            Your order <span className="text-base text-smoke">({count})</span>
          </h2>
          <button onClick={() => setOpen(false)} aria-label="Close cart" className="flex h-10 w-10 items-center justify-center rounded-full border border-cream/15 text-lg hover:border-gold">
            ×
          </button>
        </div>

        {lines.length > 0 && (
          <div className="border-b border-cream/10 px-6 py-4">
            <p className="text-xs text-smoke">
              {progress >= 1 ? "🔥 You've unlocked free delivery!" : `${money(FREE_DELIVERY_OVER - subtotal)} away from free delivery`}
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-cream/10">
              <div className="h-full rounded-full bg-gradient-to-r from-ember to-gold transition-all duration-700" style={{ width: `${progress * 100}%` }} />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6" data-lenis-prevent>
          {lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="text-5xl">🍔</div>
              <p className="mt-4 font-display text-xl">Nothing on the grill yet</p>
              <p className="mt-2 text-sm text-smoke">Add a few favourites from the menu.</p>
              <button
                onClick={() => {
                  setOpen(false);
                  setTimeout(() => scrollToId("menu"), 300);
                }}
                className="mt-6 rounded-full bg-ember px-6 py-3 text-xs font-bold uppercase tracking-wider text-ink"
              >
                See the menu
              </button>
            </div>
          ) : (
            <ul className="space-y-5">
              {lines.map(({ item, qty }) => (
                <li key={item.id} className="flex gap-4">
                  <SmartImage showLabel={false} src={item.image.replace("w=900", "w=240")} alt={item.name} className="h-20 w-20 shrink-0 rounded-2xl" />
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <span className="font-semibold">{item.name}</span>
                      <span className="text-gold">{money(item.price * qty)}</span>
                    </div>
                    <span className="text-xs text-smoke">{money(item.price)} each</span>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-cream/15">
                        <button onClick={() => setQty(item.id, qty - 1)} aria-label={`Remove one ${item.name}`} className="h-8 w-8 hover:text-ember">−</button>
                        <span className="w-6 text-center text-sm">{qty}</span>
                        <button onClick={() => setQty(item.id, qty + 1)} aria-label={`Add one ${item.name}`} className="h-8 w-8 hover:text-ember">+</button>
                      </div>
                      <button onClick={() => remove(item.id)} className="text-xs text-smoke underline-offset-4 hover:text-ember hover:underline">
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {lines.length > 0 && (
          <div className="border-t border-cream/10 p-6">
            <div className="flex justify-between font-display text-xl">
              <span>Subtotal</span>
              <span className="text-gold">{money(subtotal)}</span>
            </div>
            <p className="mt-1 text-xs text-smoke">Tax, delivery and promo codes at checkout.</p>
            <button
              onClick={() => {
                setOpen(false);
                setTimeout(() => scrollToId("order"), 300);
              }}
              className="mt-5 w-full rounded-full bg-ember py-4 text-sm font-bold uppercase tracking-wider text-ink transition hover:bg-flame"
            >
              Checkout →
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
