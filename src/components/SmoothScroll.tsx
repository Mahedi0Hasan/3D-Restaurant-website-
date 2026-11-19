"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion, setLenis } from "@/lib/scroll";

gsap.registerPlugin(ScrollTrigger);

/** Ambient glow palette per section: [blob A colour, blob B colour, A x%, B x%] */
const AMBIENT: Record<string, [string, string, number, number]> = {
  story: ["rgba(255,122,26,0.10)", "rgba(217,165,74,0.06)", 15, 80],
  menu: ["rgba(217,165,74,0.08)", "rgba(255,122,26,0.06)", 80, 20],
  signatures: ["rgba(255,122,26,0.12)", "rgba(217,165,74,0.05)", 50, 85],
  offers: ["rgba(255,154,60,0.10)", "rgba(255,122,26,0.08)", 20, 70],
  reviews: ["rgba(217,165,74,0.08)", "rgba(255,122,26,0.04)", 75, 25],
  order: ["rgba(255,122,26,0.09)", "rgba(217,165,74,0.07)", 85, 15],
  contact: ["rgba(217,165,74,0.07)", "rgba(255,122,26,0.06)", 30, 70],
};

/**
 * Lenis smooth scrolling synced with GSAP ScrollTrigger, plus global scroll reveals:
 *   data-reveal            → fade + rise
 *   data-reveal="heading"  → masked rise with blur
 *   data-reveal="image"    → clip-path reveal with inner zoom-out
 * and an ambient background glow that shifts colour per section.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const reduced = prefersReducedMotion();
    let lenis: Lenis | null = null;
    let tick: ((time: number) => void) | null = null;

    if (!reduced) {
      lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
      setLenis(lenis);
      lenis.on("scroll", ScrollTrigger.update);
      tick = (time: number) => lenis?.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    }

    const all = gsap.utils.toArray<HTMLElement>("[data-reveal]");
    const byType = (t: string) => all.filter((el) => (el.dataset.reveal || "") === t);

    if (reduced) {
      gsap.set(all, { opacity: 1, clearProps: "transform,clipPath,filter" });
    } else {
      // default: fade + rise
      const plain = byType("");
      gsap.set(plain, { opacity: 0, y: 40 });
      ScrollTrigger.batch(plain, {
        start: "top 88%",
        once: true,
        onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 1.1, ease: "power3.out", stagger: 0.09 }),
      });

      // headings: masked rise + blur
      const headings = byType("heading");
      gsap.set(headings, { opacity: 0, y: 50, filter: "blur(10px)", clipPath: "inset(0% 0% 100% 0%)" });
      ScrollTrigger.batch(headings, {
        start: "top 90%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            clipPath: "inset(0% 0% -20% 0%)",
            duration: 1.4,
            ease: "expo.out",
            stagger: 0.1,
            onComplete: function () {
              gsap.set(this.targets(), { clearProps: "filter,clipPath" });
            },
          }),
      });

      // images: clip reveal + inner zoom
      byType("image").forEach((el) => {
        const inner = el.querySelector("img, [data-reveal-inner]") ?? el.firstElementChild;
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 85%", once: true } });
        tl.fromTo(
          el,
          { clipPath: "inset(18% 12% 18% 12% round 2rem)", opacity: 0.2 },
          { clipPath: "inset(0% 0% 0% 0% round 2rem)", opacity: 1, duration: 1.6, ease: "expo.out" }
        );
        if (inner) tl.fromTo(inner, { scale: 1.3 }, { scale: 1, duration: 1.8, ease: "expo.out" }, 0);
      });

      // ambient background glow per section
      const a = document.getElementById("ambient-a");
      const b = document.getElementById("ambient-b");
      if (a && b) {
        Object.entries(AMBIENT).forEach(([id, [ca, cb, xa, xb]]) => {
          const section = document.getElementById(id);
          if (!section) return;
          const go = () => {
            gsap.to(a, { backgroundColor: ca, left: `${xa}%`, duration: 1.6, ease: "power2.out", overwrite: true });
            gsap.to(b, { backgroundColor: cb, left: `${xb}%`, duration: 1.6, ease: "power2.out", overwrite: true });
          };
          ScrollTrigger.create({ trigger: section, start: "top 55%", end: "bottom 55%", onEnter: go, onEnterBack: go });
        });
      }
    }

    // Jump to a hash on first load (e.g. /#menu)
    if (window.location.hash) {
      const id = window.location.hash.slice(1);
      setTimeout(() => {
        const el = document.getElementById(id);
        if (!el) return;
        if (lenis) lenis.scrollTo(el, { offset: -72, immediate: true });
        else el.scrollIntoView();
      }, 100);
    }

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);

    return () => {
      window.removeEventListener("load", refresh);
      if (tick) gsap.ticker.remove(tick);
      lenis?.destroy();
      setLenis(null);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        id="ambient-a"
        className="absolute top-[20%] h-[60vmax] w-[60vmax] -translate-x-1/2 rounded-full blur-[140px]"
        style={{ left: "70%", backgroundColor: "rgba(255,122,26,0.06)" }}
      />
      <div
        id="ambient-b"
        className="absolute top-[60%] h-[50vmax] w-[50vmax] -translate-x-1/2 rounded-full blur-[140px]"
        style={{ left: "20%", backgroundColor: "rgba(217,165,74,0.04)" }}
      />
    </div>
  );
}
