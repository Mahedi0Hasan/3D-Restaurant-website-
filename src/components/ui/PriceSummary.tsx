"use client";

import { money, useCart } from "@/context/CartContext";

export default function PriceSummary({ compact = false }: { compact?: boolean }) {
  const { pricing, coupon, mode } = useCart();
  return (
    <dl className={`space-y-2.5 text-sm ${compact ? "" : "border-t border-cream/10 pt-6"}`}>
      <div className="flex justify-between text-smoke">
        <dt>Subtotal</dt>
        <dd className="tabular-nums text-cream">{money(pricing.subtotal)}</dd>
      </div>
      {pricing.discount > 0 && (
        <div className="flex justify-between text-gold">
          <dt>Discount ({coupon?.code})</dt>
          <dd className="tabular-nums">−{money(pricing.discount)}</dd>
        </div>
      )}
      <div className="flex justify-between text-smoke">
        <dt>{mode === "delivery" ? "Delivery" : "Pickup"}</dt>
        <dd className="tabular-nums text-cream">{pricing.delivery ? money(pricing.delivery) : "Free"}</dd>
      </div>
      <div className="flex justify-between text-smoke">
        <dt>Tax (8%)</dt>
        <dd className="tabular-nums text-cream">{money(pricing.tax)}</dd>
      </div>
      <div className={`flex items-baseline justify-between border-t border-cream/10 pt-4 font-display ${compact ? "text-xl" : "text-2xl"}`}>
        <dt>Total</dt>
        <dd className="tabular-nums text-gold">{money(pricing.total)}</dd>
      </div>
    </dl>
  );
}
