"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { categories, menu, type Category } from "@/data/menu";
import { money } from "@/context/CartContext";
import SectionHeading from "./ui/SectionHeading";
import SmartImage from "./ui/SmartImage";
import AddButton from "./ui/AddButton";

function Spice({ level = 0 }: { level?: number }) {
  if (!level) return null;
  return (
    <span className="text-xs text-ember" aria-label={`Spice level ${level} of 3`}>
      {"🌶".repeat(level)}
    </span>
  );
}

export default function Menu() {
  const [cat, setCat] = useState<Category>("burgers");
  const grid = useRef<HTMLDivElement>(null);
  const tabs = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const first = useRef(true);

  useLayoutEffect(() => {
    const btn = tabs.current?.querySelector<HTMLButtonElement>(`[data-cat="${cat}"]`);
    if (btn) setIndicator({ left: btn.offsetLeft, width: btn.offsetWidth });

    if (first.current) {
      first.current = false;
      return;
    }
    const items = grid.current?.querySelectorAll(".menu-item");
    if (items?.length) {
      gsap.fromTo(
        items,
        { opacity: 0, y: 30, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.06, ease: "power3.out" }
      );
    }
  }, [cat]);

  useLayoutEffect(() => {
    const onResize = () => {
      const btn = tabs.current?.querySelector<HTMLButtonElement>(`[data-cat="${cat}"]`);
      if (btn) setIndicator({ left: btn.offsetLeft, width: btn.offsetWidth });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [cat]);

  const items = menu.filter((m) => m.category === cat);

  return (
    <section id="menu" className="relative py-28 md:py-36">
      <div aria-hidden className="absolute inset-x-0 top-0 hairline" />
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
          <SectionHeading
            eyebrow="The menu"
            title={
              <>
                Built on smoke, <em className="text-gradient-gold">finished by hand.</em>
              </>
            }
            intro="Everything is made from scratch daily. When the brisket is gone, it's gone."
          />

          <div
            ref={tabs}
            role="tablist"
            aria-label="Menu categories"
            className="no-scrollbar relative flex shrink-0 gap-1 overflow-x-auto rounded-full border border-cream/10 bg-coal p-1.5"
          >
            <span
              aria-hidden
              className="absolute top-1.5 bottom-1.5 rounded-full bg-ember transition-all duration-500 ease-out"
              style={{ left: indicator.left, width: indicator.width }}
            />
            {categories.map((c) => (
              <button
                key={c.id}
                data-cat={c.id}
                role="tab"
                aria-selected={cat === c.id}
                onClick={() => setCat(c.id)}
                className={`relative z-10 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
                  cat === c.id ? "text-ink" : "text-cream/70 hover:text-cream"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div ref={grid} role="tabpanel" className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <article
              key={item.id}
              className="menu-item group flex flex-col overflow-hidden rounded-3xl border border-cream/8 bg-coal transition duration-500 hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_20px_60px_-20px_rgba(255,122,26,0.35)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <SmartImage
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full transition duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-coal via-transparent to-transparent" />
                {item.tags?.[0] && (
                  <span className="absolute left-4 top-4 rounded-full bg-ink/70 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gold backdrop-blur">
                    {item.tags[0]}
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-6 pt-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-xl font-medium leading-tight">{item.name}</h3>
                  <span className="font-display text-lg text-gold">{money(item.price)}</span>
                </div>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-smoke">{item.description}</p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs text-smoke/80">
                    {item.calories && <>{item.calories} cal</>}
                    <Spice level={item.spice} />
                  </span>
                  <AddButton id={item.id} name={item.name} compact />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
