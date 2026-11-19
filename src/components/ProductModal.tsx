"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { getItem, type MenuItem } from "@/data/menu";
import { money, useCart } from "@/context/CartContext";
import { getLenis } from "@/lib/scroll";
import { flyToCart } from "@/lib/flyToCart";
import SmartImage from "./ui/SmartImage";

const ModalContext = createContext<(id: string) => void>(() => {});
export const useProductModal = () => useContext(ModalContext);

function Modal({ item, onClose }: { item: MenuItem; onClose: () => void }) {
  const { add, lines } = useCart();
  const inCart = lines.find((l) => l.item.id === item.id)?.qty ?? 0;
  const [qty, setQty] = useState(1);
  const [closing, setClosing] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setClosing(true);
    setTimeout(onClose, 260);
  }, [onClose]);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab" && panel.current) {
        const f = panel.current.querySelectorAll<HTMLElement>("button, [href], input, [tabindex]:not([tabindex='-1'])");
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      prev?.focus?.();
    };
  }, [close]);

  return (
    <div
      className={`fixed inset-0 z-[75] flex items-end justify-center sm:items-center sm:p-6 ${closing ? "pointer-events-none" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pm-title"
    >
      <div
        onClick={close}
        className={`absolute inset-0 bg-ink/80 backdrop-blur-md transition-opacity duration-300 ${closing ? "opacity-0" : "animate-[fade-in_0.3s_ease-out]"}`}
      />
      <div
        ref={panel}
        data-fly-scope
        className={`relative grid max-h-[92svh] w-full max-w-4xl overflow-hidden rounded-t-[2rem] border border-cream/10 bg-coal shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)] sm:rounded-[2rem] md:grid-cols-2 ${
          closing ? "translate-y-6 opacity-0 transition duration-300" : "animate-[sheet-in_0.5s_cubic-bezier(.2,.8,.2,1)]"
        }`}
      >
        <div data-fly-img className="relative aspect-[16/11] md:aspect-auto md:min-h-[480px]">
          <SmartImage src={item.image.replace("w=900", "w=1200")} alt={item.name} sizes="(min-width: 768px) 450px, 100vw" className="absolute inset-0 h-full w-full" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-coal via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-coal/60" />
          {item.tags?.length ? (
            <div className="absolute left-5 top-5 flex flex-wrap gap-2">
              {item.tags.map((t) => (
                <span key={t} className="rounded-full bg-ink/70 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gold backdrop-blur">
                  {t}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col overflow-y-auto p-6 sm:p-8" data-lenis-prevent>
          <div className="flex items-start justify-between gap-4">
            <h2 id="pm-title" className="font-display text-3xl font-light leading-tight sm:text-4xl">
              {item.name}
            </h2>
            <button
              ref={closeBtn}
              onClick={close}
              aria-label="Close details"
              className="-mr-2 -mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cream/15 text-lg transition hover:border-gold hover:text-gold"
            >
              ×
            </button>
          </div>
          <p className="mt-2 font-display text-2xl text-gold">{money(item.price)}</p>
          <p className="mt-4 leading-relaxed text-smoke">{item.description}</p>

          {item.ingredients?.length ? (
            <div className="mt-6">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-smoke">What&apos;s inside</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {item.ingredients.map((ing) => (
                  <li key={ing} className="rounded-full bg-cream/5 px-3 py-1.5 text-xs text-cream/85 ring-1 ring-cream/10">
                    {ing}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <dl className="mt-6 grid grid-cols-3 gap-3 rounded-2xl border border-cream/10 bg-ink/40 p-4 text-center">
            <div>
              <dt className="text-[10px] uppercase tracking-widest text-smoke">Calories</dt>
              <dd className="mt-1 font-display text-lg">{item.calories ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-widest text-smoke">Smoked</dt>
              <dd className="mt-1 font-display text-lg">{item.smokeHours ? `${item.smokeHours}h` : "—"}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-widest text-smoke">Heat</dt>
              <dd className="mt-1 flex justify-center gap-1 pt-2.5" aria-label={`${item.spice ?? 0} of 3`}>
                {[1, 2, 3].map((l) => (
                  <span key={l} className={`h-1.5 w-4 rounded-full ${l <= (item.spice ?? 0) ? "bg-ember" : "bg-cream/15"}`} />
                ))}
              </dd>
            </div>
          </dl>

          <div className="mt-auto pt-8">
            {inCart > 0 && <p className="mb-3 text-xs text-gold">✓ {inCart} already in your order</p>}
            <div className="flex items-center gap-3">
              <div className="flex h-14 items-center rounded-full border border-cream/15" role="group" aria-label="Quantity">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  aria-label="Decrease quantity"
                  className="h-full w-12 rounded-l-full text-xl transition hover:text-ember disabled:opacity-30"
                >
                  −
                </button>
                <span className="w-8 text-center font-semibold tabular-nums" aria-live="polite">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => Math.min(20, q + 1))}
                  aria-label="Increase quantity"
                  className="h-full w-12 rounded-r-full text-xl transition hover:text-ember"
                >
                  +
                </button>
              </div>
              <button
                onClick={(e) => {
                  flyToCart(e.currentTarget);
                  add(item.id, qty);
                  close();
                }}
                className="btn-shine flex h-14 flex-1 items-center justify-between gap-3 rounded-full bg-ember px-5 sm:px-6 text-sm font-bold uppercase tracking-wider text-ink transition hover:bg-flame active:scale-[0.98]"
              >
                <span className="whitespace-nowrap">
                  Add<span className="hidden sm:inline"> to order</span>
                </span>
                <span className="tabular-nums">{money(item.price * qty)}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductModalProvider({ children }: { children: React.ReactNode }) {
  const [id, setId] = useState<string | null>(null);
  const item = id ? getItem(id) : undefined;

  useEffect(() => {
    const l = getLenis();
    if (item) {
      l?.stop();
      document.body.style.overflow = "hidden";
    } else {
      l?.start();
      document.body.style.overflow = "";
    }
  }, [item]);

  return (
    <ModalContext.Provider value={setId}>
      {children}
      {item && <Modal key={item.id} item={item} onClose={() => setId(null)} />}
    </ModalContext.Provider>
  );
}
