"use client";

import { useState } from "react";
import { money, useCart } from "@/context/CartContext";

/** Promo-code input with validation feedback and an applied-coupon chip. */
export default function CouponBox({ idPrefix = "promo" }: { idPrefix?: string }) {
  const { coupon, applyCoupon, removeCoupon, pricing } = useCart();
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [shake, setShake] = useState(false);

  const apply = () => {
    const res = applyCoupon(input);
    setFeedback({ ok: res.ok, text: res.message });
    if (res.ok) setInput("");
    else {
      setShake(true);
      setTimeout(() => setShake(false), 450);
    }
  };

  if (coupon) {
    return (
      <div className="rounded-2xl border border-gold/30 bg-gold/[0.06] p-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold text-xs font-bold text-ink">%</span>
            <div className="min-w-0">
              <div className="font-mono text-sm tracking-widest text-gold">{coupon.code}</div>
              <div className="truncate text-xs text-smoke">
                {pricing.couponPending
                  ? `Add ${money(pricing.couponShortfall)} more to unlock ${coupon.percent}% off`
                  : `${coupon.percent}% off · saving ${money(pricing.discount)}`}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              removeCoupon();
              setFeedback(null);
            }}
            className="shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-cream/60 transition hover:bg-cream/5 hover:text-ember"
            aria-label={`Remove coupon ${coupon.code}`}
          >
            Remove
          </button>
        </div>
        {pricing.couponPending && (
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-cream/10">
            <div
              className="h-full rounded-full bg-gold transition-all duration-700"
              style={{ width: `${Math.min(100, (pricing.subtotal / coupon.minSubtotal) * 100)}%` }}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className={`flex gap-2 ${shake ? "animate-[shake_0.4s_ease]" : ""}`}>
        <label htmlFor={`${idPrefix}-code`} className="sr-only">
          Promo code
        </label>
        <input
          id={`${idPrefix}-code`}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (feedback && !feedback.ok) setFeedback(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              apply();
            }
          }}
          placeholder="Promo code"
          autoCapitalize="characters"
          spellCheck={false}
          aria-invalid={feedback ? !feedback.ok : undefined}
          aria-describedby={feedback ? `${idPrefix}-msg` : undefined}
          className={`min-w-0 flex-1 rounded-2xl border bg-ink/60 px-4 py-3 font-mono text-sm uppercase tracking-widest text-cream outline-none transition placeholder:font-sans placeholder:normal-case placeholder:tracking-normal placeholder:text-smoke/50 focus:ring-2 ${
            feedback && !feedback.ok ? "border-ember/70 focus:ring-ember/20" : "border-cream/10 focus:border-gold focus:ring-gold/20"
          }`}
        />
        <button
          onClick={apply}
          type="button"
          className="shrink-0 rounded-2xl border border-gold/50 px-5 text-xs font-bold uppercase tracking-wider text-gold transition hover:bg-gold hover:text-ink active:scale-95"
        >
          Apply
        </button>
      </div>
      {feedback && (
        <p id={`${idPrefix}-msg`} role="status" className={`mt-2 text-xs ${feedback.ok ? "text-gold" : "text-ember"}`}>
          {feedback.text}
        </p>
      )}
    </div>
  );
}
