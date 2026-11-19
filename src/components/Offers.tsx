"use client";

import { useEffect, useState } from "react";
import { promos, type Promo } from "@/lib/promos";
import { useCart } from "@/context/CartContext";
import { scrollToId } from "@/lib/scroll";
import { images } from "@/data/menu";
import SectionHeading from "./ui/SectionHeading";
import SmartImage from "./ui/SmartImage";

function useCountdownToMidnight() {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const calc = () => {
      const now = new Date();
      const end = new Date(now);
      end.setHours(24, 0, 0, 0);
      setLeft(Math.max(0, end.getTime() - now.getTime()));
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, []);
  if (left === null) return null;
  const s = Math.floor(left / 1000);
  return { h: Math.floor(s / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  return (
    <button
      onClick={copy}
      className="group inline-flex items-center gap-3 rounded-full border border-dashed border-gold/60 px-4 py-2 font-mono text-sm tracking-widest text-gold transition hover:bg-gold/10"
      aria-label={`Copy promo code ${code}`}
    >
      {code}
      <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-cream/60 group-hover:text-cream">
        {copied ? "Copied ✓" : "Copy"}
      </span>
    </button>
  );
}

function UseCode({ promo, label = "Apply to order →" }: { promo: Promo; label?: string }) {
  const { applyCoupon, coupon } = useCart();
  const active = coupon?.code === promo.code;
  return (
    <button
      onClick={() => {
        applyCoupon(promo.code);
        scrollToId("order");
      }}
      className={`text-xs font-bold uppercase tracking-wider transition ${active ? "text-gold" : "text-cream/70 hover:text-ember"}`}
    >
      {active ? "✓ Applied" : label}
    </button>
  );
}

export default function Offers() {
  const cd = useCountdownToMidnight();
  const [main, ...rest] = promos;
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section id="offers" className="relative py-28 md:py-36">
      {/* Marquee band */}
      <div aria-hidden className="mb-24 -rotate-2 overflow-hidden border-y border-ember/30 bg-ember py-4 text-ink">
        <div className="animate-marquee flex w-max whitespace-nowrap font-display text-3xl font-light italic md:text-5xl">
          {Array.from({ length: 2 }).map((_, k) => (
            <span key={k} className="flex">
              {["Smoked low", "Served bold", "Since 1986", "Post-oak fire", "14-hour brisket", "Dry-aged beef"].map((w) => (
                <span key={w} className="mx-8 flex items-center gap-8">
                  {w} <span className="text-2xl not-italic">✦</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeading
          eyebrow="Special offers"
          title={
            <>
              Fire deals, <em className="text-gradient-gold">limited time.</em>
            </>
          }
          intro="Copy a code and apply it at checkout. Discounts are calculated automatically."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-5">
          {/* Feature offer */}
          <article
            data-reveal
            className="relative overflow-hidden rounded-[2rem] border border-gold/25 bg-coal lg:col-span-3 lg:row-span-2"
          >
            <SmartImage showLabel={false} src={images.offerBurger} alt="Pitmaster feast spread" className="absolute inset-0 h-full w-full opacity-55" />
            <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/10" />
            <div className="relative flex h-full min-h-[440px] flex-col p-8 md:p-12">
              <span className="w-fit rounded-full bg-ember px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-ink">
                Today only
              </span>
              <h3 className="mt-6 max-w-sm font-display text-5xl font-light leading-none md:text-6xl">
                {main.title}
                <span className="mt-2 block text-gradient-gold">{main.percent}% off</span>
              </h3>
              <p className="mt-5 max-w-sm text-smoke">{main.description}</p>

              <div className="mt-8 flex gap-3" aria-label="Offer ends in">
                {cd
                  ? [
                      { v: cd.h, l: "Hours" },
                      { v: cd.m, l: "Min" },
                      { v: cd.s, l: "Sec" },
                    ].map((x) => (
                      <div key={x.l} className="w-20 rounded-2xl glass py-3 text-center">
                        <div className="font-display text-3xl tabular-nums">{pad(x.v)}</div>
                        <div className="text-[10px] uppercase tracking-widest text-smoke">{x.l}</div>
                      </div>
                    ))
                  : <div className="h-[74px]" />}
              </div>

              <div className="mt-auto flex flex-wrap items-center gap-4 pt-10">
                <CopyCode code={main.code} />
                <button
                  onClick={() => scrollToId("menu")}
                  className="btn-shine rounded-full bg-ember px-6 py-3 text-xs font-bold uppercase tracking-wider text-ink transition hover:bg-flame"
                >
                  Build your feast →
                </button>
                <UseCode promo={main} label="Apply code" />
              </div>
            </div>
          </article>

          {rest.map((p) => (
            <article
              key={p.code}
              data-reveal
              className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-cream/10 bg-gradient-to-br from-char to-coal p-8 lg:col-span-2"
            >
              <div aria-hidden className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-ember/15 blur-3xl transition group-hover:bg-ember/30" />
              <div className="flex items-baseline justify-between">
                <h3 className="font-display text-2xl font-light">{p.title}</h3>
                <span className="font-display text-5xl font-light text-gold">
                  {p.percent}
                  <span className="text-2xl">%</span>
                </span>
              </div>
              <p className="mt-3 flex-1 text-sm text-smoke">{p.description}</p>
              <div className="mt-6 flex items-center justify-between gap-3">
                <CopyCode code={p.code} />
                <UseCode promo={p} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
