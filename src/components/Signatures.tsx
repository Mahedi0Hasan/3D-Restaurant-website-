"use client";

import { useRef, useState } from "react";
import { getItem, signatureIds, type MenuItem } from "@/data/menu";
import { money } from "@/context/CartContext";
import SectionHeading from "./ui/SectionHeading";
import SmartImage from "./ui/SmartImage";
import AddButton from "./ui/AddButton";

function TiltCard({ item, index }: { item: MenuItem; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [flipped, setFlipped] = useState(false);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, gx: 50, gy: 50, active: false });

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") return;
    const r = ref.current!.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    setTilt({ rx: (0.5 - py) * 14, ry: (px - 0.5) * 18, gx: px * 100, gy: py * 100, active: true });
  };

  const reset = () => setTilt({ rx: 0, ry: 0, gx: 50, gy: 50, active: false });

  return (
    <div data-reveal data-fly-scope className="[perspective:1200px]" style={{ transitionDelay: `${index * 60}ms` }}>
      <div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={reset}
        className="relative transition-transform duration-300 ease-out will-change-transform"
        style={{ transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`, transformStyle: "preserve-3d" }}
      >
        <div
          role="button"
          tabIndex={0}
          aria-pressed={flipped}
          aria-label={`${item.name} — ${flipped ? "hide" : "show"} details`}
          onClick={() => setFlipped((f) => !f)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setFlipped((f) => !f);
            }
          }}
          className="relative aspect-[3/4] cursor-pointer outline-none transition-transform duration-700 [transform-style:preserve-3d] focus-visible:ring-2 focus-visible:ring-gold rounded-[1.75rem]"
          style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          {/* Front */}
          <div className="absolute inset-0 overflow-hidden rounded-[1.75rem] border border-cream/10 [backface-visibility:hidden]">
            <div data-fly-img className="h-full w-full"><SmartImage src={item.image} alt={item.name} showLabel={false} className="h-full w-full" /></div>
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 transition-opacity duration-300"
              style={{
                opacity: tilt.active ? 1 : 0,
                background: `radial-gradient(circle at ${tilt.gx}% ${tilt.gy}%, rgba(255,210,150,0.25), transparent 50%)`,
              }}
            />
            <div className="absolute left-5 top-5 font-display text-sm text-gold" style={{ transform: "translateZ(40px)" }}>
              No. {String(index + 1).padStart(2, "0")}
            </div>
            <div className="absolute inset-x-0 bottom-0 p-6" style={{ transform: "translateZ(60px)" }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-ember">{item.tags?.[0] ?? "Signature"}</p>
              <h3 className="mt-2 font-display text-3xl font-light leading-none">{item.name}</h3>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-display text-xl text-gold">{money(item.price)}</span>
                <span className="rounded-full border border-cream/20 px-3 py-1 text-[11px] text-cream/80">Tap for details ↻</span>
              </div>
            </div>
          </div>

          {/* Back */}
          <div className="absolute inset-0 flex flex-col rounded-[1.75rem] border border-gold/30 bg-gradient-to-br from-char via-coal to-ink p-7 [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold">Inside the build</p>
            <h3 className="mt-2 font-display text-2xl font-light">{item.name}</h3>
            <p className="mt-3 text-sm leading-relaxed text-smoke">{item.description}</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {item.ingredients?.map((ing) => (
                <li key={ing} className="rounded-full bg-cream/5 px-3 py-1 text-xs text-cream/85 ring-1 ring-cream/10">
                  {ing}
                </li>
              ))}
            </ul>
            <dl className="mt-auto grid grid-cols-3 gap-3 border-t border-cream/10 pt-5 text-center">
              <div>
                <dt className="text-[10px] uppercase tracking-widest text-smoke">Smoke</dt>
                <dd className="mt-1 font-display text-lg text-cream">{item.smokeHours ? `${item.smokeHours}h` : "—"}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-widest text-smoke">Cal</dt>
                <dd className="mt-1 font-display text-lg text-cream">{item.calories}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-widest text-smoke">Heat</dt>
                <dd className="mt-1 flex justify-center gap-1 pt-2">
                  {[1, 2, 3].map((l) => (
                    <span key={l} className={`h-1.5 w-4 rounded-full ${l <= (item.spice ?? 0) ? "bg-ember" : "bg-cream/15"}`} />
                  ))}
                </dd>
              </div>
            </dl>
            <div className="mt-5 flex items-center justify-between">
              <span className="font-display text-xl text-gold">{money(item.price)}</span>
              <AddButton id={item.id} name={item.name} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Signatures() {
  const items = signatureIds.map(getItem).filter((i): i is MenuItem => !!i);
  return (
    <section id="signatures" className="relative overflow-hidden py-28 md:py-36">
      <div aria-hidden className="pointer-events-none absolute -left-40 top-1/3 h-96 w-96 rounded-full bg-ember/10 blur-[120px]" />
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeading
          align="center"
          eyebrow="Chef's signatures"
          title={
            <>
              The plates that made <em className="text-gradient-gold">our name.</em>
            </>
          }
          intro="Hover to feel the heat, tap any card to see what goes into it."
        />
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <TiltCard key={item.id} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
