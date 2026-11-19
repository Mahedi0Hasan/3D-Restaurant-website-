"use client";

import { useCart } from "@/context/CartContext";

/** "Add" button that turns into a quantity stepper once the item is in the cart. */
export default function AddButton({ id, name, compact = false }: { id: string; name: string; compact?: boolean }) {
  const { lines, add, setQty } = useCart();
  const qty = lines.find((l) => l.item.id === id)?.qty ?? 0;

  if (qty === 0) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          add(id);
        }}
        aria-label={`Add ${name} to order`}
        className={`inline-flex items-center gap-2 rounded-full bg-cream/5 font-semibold text-cream ring-1 ring-cream/15 transition hover:bg-ember hover:text-ink hover:ring-ember ${
          compact ? "h-9 px-4 text-xs" : "h-10 px-5 text-sm"
        }`}
      >
        <span className="text-base leading-none">+</span> Add
      </button>
    );
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`inline-flex items-center rounded-full bg-ember font-bold text-ink ${compact ? "h-9" : "h-10"}`}
    >
      <button
        onClick={() => setQty(id, qty - 1)}
        aria-label={`Remove one ${name}`}
        className="h-full w-9 rounded-l-full text-lg leading-none transition hover:bg-flame"
      >
        −
      </button>
      <span className="min-w-6 text-center text-sm" aria-live="polite">
        {qty}
      </span>
      <button
        onClick={() => add(id)}
        aria-label={`Add one more ${name}`}
        className="h-full w-9 rounded-r-full text-lg leading-none transition hover:bg-flame"
      >
        +
      </button>
    </div>
  );
}
