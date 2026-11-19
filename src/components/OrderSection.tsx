"use client";

import { useState } from "react";
import { DELIVERY_FEE, FREE_DELIVERY_OVER, TAX_RATE, money, useCart } from "@/context/CartContext";
import { findPromo, type Promo } from "@/lib/promos";
import { getItem } from "@/data/menu";
import { scrollToId } from "@/lib/scroll";
import SectionHeading from "./ui/SectionHeading";
import SmartImage from "./ui/SmartImage";
import AddButton from "./ui/AddButton";

type Mode = "delivery" | "pickup";

interface Form {
  name: string;
  phone: string;
  email: string;
  address: string;
  time: string;
  payment: string;
  notes: string;
}

const empty: Form = { name: "", phone: "", email: "", address: "", time: "asap", payment: "card-on-arrival", notes: "" };

function validate(f: Form, mode: Mode) {
  const e: Partial<Record<keyof Form, string>> = {};
  if (f.name.trim().length < 2) e.name = "Please enter your name.";
  if (!/^[+()\d\s-]{7,20}$/.test(f.phone.trim()) || f.phone.replace(/\D/g, "").length < 7)
    e.phone = "Enter a valid phone number.";
  if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = "Enter a valid email.";
  if (mode === "delivery" && f.address.trim().length < 6) e.address = "We need a delivery address.";
  return e;
}

export function usePricing(promo: Promo | null, mode: Mode) {
  const { subtotal } = useCart();
  const promoValid = !!promo && subtotal >= promo.minSubtotal;
  const discount = promoValid ? subtotal * (promo!.percent / 100) : 0;
  const after = subtotal - discount;
  const delivery = mode === "delivery" && subtotal > 0 && after < FREE_DELIVERY_OVER ? DELIVERY_FEE : 0;
  const tax = after * TAX_RATE;
  return { subtotal, discount, delivery, tax, total: after + delivery + tax, promoValid };
}

const field =
  "w-full rounded-2xl border border-cream/10 bg-ink/60 px-4 py-3.5 text-sm text-cream placeholder:text-smoke/50 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20";

export default function OrderSection() {
  const { lines, setQty, clear, count } = useCart();
  const [mode, setMode] = useState<Mode>("delivery");
  const [form, setForm] = useState<Form>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [touched, setTouched] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<Promo | null>(null);
  const [promoMsg, setPromoMsg] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [receipt, setReceipt] = useState<{ id: string; total: number; eta: string; name: string; mode: Mode } | null>(null);

  const pricing = usePricing(promo, mode);

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const next = { ...form, [k]: e.target.value };
    setForm(next);
    if (touched) setErrors(validate(next, mode));
  };

  const applyPromo = () => {
    const p = findPromo(promoInput);
    if (!p) {
      setPromo(null);
      setPromoMsg("That code isn't valid.");
      return;
    }
    setPromo(p);
    setPromoMsg(
      pricing.subtotal >= p.minSubtotal
        ? `${p.code} applied — ${p.percent}% off.`
        : `${p.code} saved. Add ${money(p.minSubtotal - pricing.subtotal)} more to unlock ${p.percent}% off.`
    );
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    const errs = validate(form, mode);
    setErrors(errs);
    if (Object.keys(errs).length) {
      const firstKey = Object.keys(errs)[0];
      document.getElementById(`f-${firstKey}`)?.focus();
      return;
    }
    if (!lines.length) return;
    setStatus("sending");
    setTimeout(() => {
      const id = "SH-" + Math.random().toString(36).slice(2, 8).toUpperCase();
      setReceipt({
        id,
        total: pricing.total,
        eta: mode === "delivery" ? "30–40 min" : "15–20 min",
        name: form.name.split(" ")[0],
        mode,
      });
      setStatus("done");
      clear();
      setForm(empty);
      setPromo(null);
      setPromoInput("");
      setPromoMsg(null);
      setTouched(false);
    }, 1400);
  };

  const popular = ["the-1986", "brisket-stack", "tallow-fries", "bourbon-shake"].map((id) => getItem(id)!);
  const err = (k: keyof Form) =>
    errors[k] ? (
      <p id={`e-${k}`} className="mt-1.5 text-xs text-ember">
        {errors[k]}
      </p>
    ) : null;

  return (
    <section id="order" className="relative py-28 md:py-36">
      <div aria-hidden className="absolute inset-x-0 top-0 hairline" />
      <div aria-hidden className="pointer-events-none absolute right-0 top-40 h-[500px] w-[500px] rounded-full bg-gold/5 blur-[140px]" />
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeading
          eyebrow="Order online"
          title={
            <>
              Hot from our pit <em className="text-gradient-gold">to your door.</em>
            </>
          }
          intro={`Free delivery on orders over ${money(FREE_DELIVERY_OVER)}. Pickup is always free.`}
        />

        <div className="mt-14 grid gap-8 lg:grid-cols-[1.15fr_1fr]">
          {/* Form */}
          <form onSubmit={submit} noValidate className="rounded-[2rem] border border-cream/10 bg-coal p-6 md:p-10" aria-label="Checkout">
            <div role="radiogroup" aria-label="Order type" className="grid grid-cols-2 gap-2 rounded-full border border-cream/10 bg-ink/60 p-1.5">
              {(["delivery", "pickup"] as Mode[]).map((m) => (
                <button
                  type="button"
                  key={m}
                  role="radio"
                  aria-checked={mode === m}
                  onClick={() => {
                    setMode(m);
                    if (touched) setErrors(validate(form, m));
                  }}
                  className={`rounded-full py-3 text-sm font-semibold capitalize transition ${
                    mode === m ? "bg-ember text-ink" : "text-cream/70 hover:text-cream"
                  }`}
                >
                  {m === "delivery" ? "🛵  Delivery" : "🔥  Pickup"}
                </button>
              ))}
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="f-name" className="mb-2 block text-xs font-semibold uppercase tracking-widest text-smoke">Full name *</label>
                <input id="f-name" className={field} value={form.name} onChange={set("name")} autoComplete="name" placeholder="Alex Carter" aria-invalid={!!errors.name} aria-describedby={errors.name ? "e-name" : undefined} />
                {err("name")}
              </div>
              <div>
                <label htmlFor="f-phone" className="mb-2 block text-xs font-semibold uppercase tracking-widest text-smoke">Phone *</label>
                <input id="f-phone" type="tel" className={field} value={form.phone} onChange={set("phone")} autoComplete="tel" placeholder="(512) 555-0100" aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "e-phone" : undefined} />
                {err("phone")}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="f-email" className="mb-2 block text-xs font-semibold uppercase tracking-widest text-smoke">Email <span className="normal-case tracking-normal text-smoke/60">(for receipt)</span></label>
                <input id="f-email" type="email" className={field} value={form.email} onChange={set("email")} autoComplete="email" placeholder="you@email.com" aria-invalid={!!errors.email} aria-describedby={errors.email ? "e-email" : undefined} />
                {err("email")}
              </div>
              {mode === "delivery" && (
                <div className="sm:col-span-2">
                  <label htmlFor="f-address" className="mb-2 block text-xs font-semibold uppercase tracking-widest text-smoke">Delivery address *</label>
                  <input id="f-address" className={field} value={form.address} onChange={set("address")} autoComplete="street-address" placeholder="Street, apt, city" aria-invalid={!!errors.address} aria-describedby={errors.address ? "e-address" : undefined} />
                  {err("address")}
                </div>
              )}
              <div>
                <label htmlFor="f-time" className="mb-2 block text-xs font-semibold uppercase tracking-widest text-smoke">When</label>
                <select id="f-time" className={field} value={form.time} onChange={set("time")}>
                  <option value="asap">As soon as possible</option>
                  <option value="30">In 30 minutes</option>
                  <option value="60">In 1 hour</option>
                  <option value="evening">This evening, 7pm</option>
                </select>
              </div>
              <div>
                <label htmlFor="f-payment" className="mb-2 block text-xs font-semibold uppercase tracking-widest text-smoke">Payment</label>
                <select id="f-payment" className={field} value={form.payment} onChange={set("payment")}>
                  <option value="card-on-arrival">Card on {mode === "delivery" ? "delivery" : "pickup"}</option>
                  <option value="cash">Cash</option>
                  <option value="wallet">Apple / Google Pay</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="f-notes" className="mb-2 block text-xs font-semibold uppercase tracking-widest text-smoke">Notes for the kitchen</label>
                <textarea id="f-notes" rows={3} className={field} value={form.notes} onChange={set("notes")} placeholder="Allergies, extra sauce, gate code…" />
              </div>
            </div>

            <button
              type="submit"
              disabled={!lines.length || status === "sending"}
              className="mt-8 flex w-full items-center justify-center gap-3 rounded-full bg-ember py-4 text-sm font-bold uppercase tracking-wider text-ink transition hover:bg-flame hover:shadow-[0_0_40px_rgba(255,122,26,0.45)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:shadow-none"
            >
              {status === "sending" ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink border-t-transparent" /> Placing order…
                </>
              ) : lines.length ? (
                <>Place order · {money(pricing.total)}</>
              ) : (
                <>Add items to place an order</>
              )}
            </button>
            <p className="mt-4 text-center text-[11px] text-smoke/60">Demo checkout: no payment is taken and no order is sent.</p>
          </form>

          {/* Summary */}
          <aside className="h-fit rounded-[2rem] border border-cream/10 bg-gradient-to-b from-char to-coal p-6 md:p-8 lg:sticky lg:top-28" aria-label="Order summary">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl font-light">Your order</h3>
              <span className="text-xs text-smoke">{count} item{count === 1 ? "" : "s"}</span>
            </div>

            {lines.length === 0 ? (
              <div className="mt-6">
                <p className="text-sm text-smoke">Your basket is empty. Start with a crowd favourite:</p>
                <ul className="mt-5 space-y-3">
                  {popular.map((p) => (
                    <li key={p.id} className="flex items-center gap-3">
                      <SmartImage showLabel={false} src={p.image.replace("w=900", "w=200")} alt={p.name} className="h-12 w-12 shrink-0 rounded-xl" />
                      <div className="flex-1">
                        <div className="text-sm font-semibold">{p.name}</div>
                        <div className="text-xs text-gold">{money(p.price)}</div>
                      </div>
                      <AddButton id={p.id} name={p.name} compact />
                    </li>
                  ))}
                </ul>
                <button onClick={() => scrollToId("menu")} className="mt-6 text-xs font-bold uppercase tracking-wider text-ember hover:text-flame">
                  Browse full menu →
                </button>
              </div>
            ) : (
              <>
                <ul className="mt-6 max-h-[340px] space-y-4 overflow-y-auto pr-1" data-lenis-prevent>
                  {lines.map(({ item, qty }) => (
                    <li key={item.id} className="flex items-center gap-3">
                      <SmartImage showLabel={false} src={item.image.replace("w=900", "w=200")} alt={item.name} className="h-14 w-14 shrink-0 rounded-xl" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold">{item.name}</div>
                        <div className="text-xs text-smoke">{money(item.price)} each</div>
                      </div>
                      <div className="flex items-center rounded-full border border-cream/15">
                        <button onClick={() => setQty(item.id, qty - 1)} aria-label={`Remove one ${item.name}`} className="h-8 w-8 rounded-full text-cream/80 hover:text-ember">−</button>
                        <span className="w-5 text-center text-sm">{qty}</span>
                        <button onClick={() => setQty(item.id, qty + 1)} aria-label={`Add one ${item.name}`} className="h-8 w-8 rounded-full text-cream/80 hover:text-ember">+</button>
                      </div>
                      <div className="w-16 text-right text-sm font-semibold">{money(item.price * qty)}</div>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex gap-2">
                  <label htmlFor="promo" className="sr-only">Promo code</label>
                  <input
                    id="promo"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyPromo())}
                    placeholder="Promo code"
                    className={`${field} py-3 font-mono uppercase tracking-widest`}
                  />
                  <button onClick={applyPromo} type="button" className="shrink-0 rounded-2xl border border-gold/50 px-5 text-xs font-bold uppercase tracking-wider text-gold transition hover:bg-gold hover:text-ink">
                    Apply
                  </button>
                </div>
                {promoMsg && <p className={`mt-2 text-xs ${promo ? "text-gold" : "text-ember"}`} role="status">{promoMsg}</p>}

                <dl className="mt-6 space-y-2.5 border-t border-cream/10 pt-6 text-sm">
                  <div className="flex justify-between text-smoke"><dt>Subtotal</dt><dd className="text-cream">{money(pricing.subtotal)}</dd></div>
                  {pricing.discount > 0 && (
                    <div className="flex justify-between text-gold"><dt>Discount ({promo?.code})</dt><dd>−{money(pricing.discount)}</dd></div>
                  )}
                  <div className="flex justify-between text-smoke">
                    <dt>{mode === "delivery" ? "Delivery" : "Pickup"}</dt>
                    <dd className="text-cream">{pricing.delivery ? money(pricing.delivery) : "Free"}</dd>
                  </div>
                  <div className="flex justify-between text-smoke"><dt>Tax (8%)</dt><dd className="text-cream">{money(pricing.tax)}</dd></div>
                  <div className="flex justify-between border-t border-cream/10 pt-4 font-display text-2xl"><dt>Total</dt><dd className="text-gold">{money(pricing.total)}</dd></div>
                </dl>
                {mode === "delivery" && pricing.delivery > 0 && (
                  <p className="mt-3 text-xs text-smoke">Add {money(FREE_DELIVERY_OVER - (pricing.subtotal - pricing.discount))} more for free delivery.</p>
                )}
              </>
            )}
          </aside>
        </div>
      </div>

      {/* Success modal */}
      {status === "done" && receipt && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/80 p-6 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="ok-title">
          <div className="w-full max-w-md rounded-[2rem] border border-gold/30 bg-coal p-8 text-center shadow-[0_0_80px_rgba(255,122,26,0.25)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ember text-3xl text-ink">✓</div>
            <h3 id="ok-title" className="mt-6 font-display text-3xl font-light">Fire&apos;s lit, {receipt.name}!</h3>
            <p className="mt-3 text-smoke">
              Order <span className="font-mono text-gold">{receipt.id}</span> is with the pitmaster.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-ink/60 p-4">
                <div className="text-[10px] uppercase tracking-widest text-smoke">{receipt.mode === "delivery" ? "Arrives in" : "Ready in"}</div>
                <div className="mt-1 font-display text-xl">{receipt.eta}</div>
              </div>
              <div className="rounded-2xl bg-ink/60 p-4">
                <div className="text-[10px] uppercase tracking-widest text-smoke">Total</div>
                <div className="mt-1 font-display text-xl text-gold">{money(receipt.total)}</div>
              </div>
            </div>
            <p className="mt-5 text-[11px] text-smoke/60">This is a demo, so no real order was placed.</p>
            <button
              autoFocus
              onClick={() => {
                setStatus("idle");
                setReceipt(null);
              }}
              className="mt-6 w-full rounded-full bg-ember py-3.5 text-sm font-bold uppercase tracking-wider text-ink hover:bg-flame"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

