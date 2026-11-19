"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import SmartImage from "./ui/SmartImage";
import SectionHeading from "./ui/SectionHeading";
import { images } from "@/data/menu";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const stats = [
  { value: 40, suffix: "", label: "Years over the pit" },
  { value: 14, suffix: "h", label: "Brisket smoke time" },
  { value: 4.9, suffix: "★", label: "From 12,000+ guests", decimals: 1 },
];

export default function Intro() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.to(".parallax-slow", {
        yPercent: -12,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
      });
      gsap.to(".parallax-fast", {
        yPercent: -35,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
      });

      gsap.utils.toArray<HTMLElement>(".stat-num").forEach((el) => {
        const end = Number(el.dataset.value);
        const decimals = Number(el.dataset.decimals ?? 0);
        const obj = { v: 0 };
        gsap.to(obj, {
          v: end,
          duration: 2,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
          onUpdate: () => {
            el.textContent = obj.v.toFixed(decimals);
          },
        });
      });
    },
    { scope: root }
  );

  return (
    <section id="story" ref={root} className="relative overflow-hidden py-28 md:py-40">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2 lg:gap-24 lg:px-10">
        <div className="relative order-2 lg:order-1">
          <div className="parallax-slow relative aspect-[4/5] w-[85%]">
            <div data-reveal="image" className="relative h-full w-full overflow-hidden rounded-[2rem]">
            <SmartImage sizes="(min-width: 1024px) 40vw, 85vw" src={images.interior} alt="Inside the Smokehouse dining room" className="h-full w-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
            </div>
          </div>
          <div className="parallax-fast absolute -bottom-10 right-0 aspect-square w-[48%] overflow-hidden rounded-[1.5rem] border-4 border-ink shadow-2xl">
            <SmartImage src={images.pitmaster} alt="Meat smoking over the fire" className="h-full w-full" />
          </div>
          <div className="absolute left-[60%] top-8 hidden rounded-full glass px-5 py-3 text-xs font-semibold uppercase tracking-widest text-gold sm:block">
            Post-oak only
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <SectionHeading
            eyebrow="Our story · Since 1986"
            title={
              <>
                Forty years of <em className="text-gradient-gold">fire, oak</em> &amp; patience.
              </>
            }
          />
          <div data-reveal className="mt-8 space-y-5 text-base leading-relaxed text-smoke md:text-lg">
            <p>
              It started with one offset smoker and a stubborn idea: never rush the meat. In 1986, Pitmaster Ray Callahan
              lit the first fire on Ember Lane, and it hasn&apos;t gone out since.
            </p>
            <p>
              Today we dry-age our own beef, split our own post-oak, and grind every patty in-house each morning. Same
              fire. Same patience. Just a few more seats.
            </p>
          </div>

          <dl className="mt-12 grid grid-cols-3 gap-4 border-t border-cream/10 pt-10">
            {stats.map((s) => (
              <div key={s.label} data-reveal>
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-display text-4xl font-light text-cream md:text-5xl">
                  <span className="stat-num" data-value={s.value} data-decimals={s.decimals ?? 0}>
                    {s.value}
                  </span>
                  <span className="text-gold">{s.suffix}</span>
                </dd>
                <p className="mt-2 text-xs uppercase tracking-widest text-smoke">{s.label}</p>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
