"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { categories, menu, type Category } from "@/data/menu";
import { money } from "@/context/CartContext";
import SectionHeading from "./ui/SectionHeading";
import SmartImage from "./ui/SmartImage";
import AddButton from "./ui/AddButton";
import { useProductModal } from "./ProductModal";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/scroll";

gsap.registerPlugin(ScrollTrigger);

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
  const openProduct = useProductModal();

  useLayoutEffect(() => {
    const btn = tabs.current?.querySelector<HTMLButtonElement>(`[data-cat="${cat}"]`);
    if (btn) setIndicator({ left: btn.offsetLeft, width: btn.offsetWidth });

    const items = grid.current?.querySelectorAll(".menu-item");
    if (first.current) {
      first.current = false;
      // initial entrance when the grid scrolls into view
      if (items?.length && !prefersReducedMotion()) {
        gsap.fromTo(
          items,
          { opacity: 0, y: 50, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: { trigger: grid.current, start: "top 85%", once: true },
          }
        );
      }
      return;
    }
    if (items?.length && !prefersReducedMotion()) {
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
                <span className={`ml-1.5 text-[10px] tabular-nums ${cat === c.id ? "text-ink/60" : "text-smoke/60"}`}>
                  {menu.filter((m) => m.category === c.id).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div ref={grid} role="tabpanel" className="mt-10 grid gap-5 sm:mt-14 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {items.map((item) => (
            <article
              key={item.id}
              data-fly-scope
              className="menu-item group relative flex flex-col overflow-hidden rounded-3xl border border-cream/8 bg-coal transition duration-500 hover:-translate-y-1.5 hover:border-gold/40 hover:shadow-[0_24px_70px_-24px_rgba(255,122,26,0.45)]"
            >
              <button
                type="button"
                onClick={() => openProduct(item.id)}
                aria-label={`View details for ${item.name}`}
                className="relative block aspect-[4/3] overflow-hidden text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold"
              >
                <div data-fly-img className="h-full w-full">
                  <SmartImage
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full transition duration-[1.2s] ease-out group-hover:scale-110"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-coal via-coal/10 to-transparent" />
                {item.tags?.[0] && (
                  <span className="absolute left-4 top-4 rounded-full bg-ink/70 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gold backdrop-blur">
                    {item.tags[0]}
                  </span>
                )}
                <span className="absolute right-4 top-4 flex h-9 translate-y-1 items-center gap-1.5 rounded-full bg-ink/70 px-3 text-[11px] font-semibold text-cream opacity-0 backdrop-blur transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  Details <span aria-hidden>↗</span>
                </span>
              </button>
              <div className="flex flex-1 flex-col p-5 pt-3 sm:p-6 sm:pt-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-xl font-medium leading-tight">
                    <button type="button" onClick={() => openProduct(item.id)} className="text-left transition hover:text-gold">
                      {item.name}
                    </button>
                  </h3>
                  <span className="shrink-0 font-display text-lg tabular-nums text-gold">{money(item.price)}</span>
                </div>
                <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-smoke">{item.description}</p>
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
