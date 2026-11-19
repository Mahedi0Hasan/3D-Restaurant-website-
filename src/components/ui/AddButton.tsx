"use client";

import { useCart } from "@/context/CartContext";
import { flyToCart } from "@/lib/flyToCart";

/** "Add" button that turns into a quantity stepper once the item is in the cart. */
export default function AddButton({ id, name, compact = false }: { id: string; name: string; compact?: boolean }) {
  const { lines, add, setQty } = useCart();
  const qty = lines.find((l) => l.item.id === id)?.qty ?? 0;
  const h = compact ? "h-10" : "h-11";

  if (qty === 0) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          flyToCart(e.currentTarget);
          add(id);
        }}
        aria-label={`Add ${name} to order`}
        className={`inline-flex items-center gap-2 rounded-full bg-cream/5 font-semibold text-cream ring-1 ring-cream/15 transition duration-300 hover:bg-ember hover:text-ink hover:ring-ember active:scale-95 ${h} ${
          compact ? "px-4 text-xs" : "px-5 text-sm"
        }`}
      >
        <span className="text-base leading-none">+</span> Add
      </button>
    );
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`inline-flex animate-[fade-up_0.3s_ease-out] items-center rounded-full bg-ember font-bold text-ink shadow-[0_6px_24px_-8px_rgba(255,122,26,0.8)] ${h}`}
    >
      <button
        onClick={() => setQty(id, qty - 1)}
        aria-label={`Remove one ${name}`}
        className="h-full w-10 rounded-l-full text-lg leading-none transition hover:bg-flame active:scale-90"
      >
        −
      </button>
      <span key={qty} className="min-w-6 animate-[fade-up_0.25s_ease-out] text-center text-sm tabular-nums" aria-live="polite">
        {qty}
      </span>
      <button
        onClick={(e) => {
          flyToCart(e.currentTarget);
          add(id);
        }}
        aria-label={`Add one more ${name}`}
        className="h-full w-10 rounded-r-full text-lg leading-none transition hover:bg-flame active:scale-90"
      >
        +
      </button>
    </div>
  );
}
