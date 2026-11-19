"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { prefersReducedMotion, scrollToId } from "@/lib/scroll";
import SmartImage from "./ui/SmartImage";
import Magnetic from "./ui/Magnetic";
import { menu } from "@/data/menu";
import type { SceneQuality } from "./three/HeroScene";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const HeroScene = dynamic(() => import("./three/HeroScene"), { ssr: false });

class SceneBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function detectQuality(): SceneQuality & { webgl: boolean } {
  let webgl = false;
  try {
    const c = document.createElement("canvas");
    webgl = !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    webgl = false;
  }
  const nav = navigator as Navigator & { deviceMemory?: number };
  const low =
    window.innerWidth < 768 ||
    (nav.hardwareConcurrency ?? 8) <= 4 ||
    (nav.deviceMemory ?? 8) <= 4;
  return { webgl, low, reduced: prefersReducedMotion() };
}

function Fallback() {
  return (
    <div className="absolute inset-0 flex items-start justify-center pt-[16vh] lg:items-center lg:justify-end lg:pr-[8vw] lg:pt-0">
      <SmartImage
        src={menu[0].image}
        alt="The 1986 burger"
        priority
        className="h-[34vh] w-[34vh] rounded-full opacity-90 shadow-[0_0_120px_rgba(255,122,26,0.35)] lg:h-[46vh] lg:w-[46vh]"
      />
    </div>
  );
}

const HEADLINE: { text: string; gold?: boolean }[][] = [
  [{ text: "Smoked" }, { text: "low." }],
  [{ text: "Served" }, { text: "bold.", gold: true }],
];

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [quality, setQuality] = useState<(SceneQuality & { webgl: boolean }) | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuality(detectQuality());
  }, []);

  useGSAP(
    () => {
      const reduced = prefersReducedMotion();
      if (reduced) {
        gsap.set(".hero-word, .hero-fade, .hero-glow, .hero-canvas", { clearProps: "all", opacity: 1 });
      } else {
        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
        tl.fromTo(".hero-canvas", { opacity: 0, scale: 1.08 }, { opacity: 1, scale: 1, duration: 2.4, ease: "power2.out" }, 0)
          .from(".hero-glow", { opacity: 0, scale: 0.6, duration: 2.2, stagger: 0.15 }, 0)
          .from(".hero-eyebrow", { opacity: 0, letterSpacing: "0.9em", duration: 1.6 }, 0.2)
          .from(
            ".hero-word",
            { yPercent: 115, rotate: 4, opacity: 0, filter: "blur(10px)", duration: 1.5, stagger: 0.09 },
            0.35
          )
          .from(".hero-fade", { opacity: 0, y: 26, filter: "blur(6px)", duration: 1.2, stagger: 0.1 }, 0.9)
          .from(".hero-watermark", { opacity: 0, y: 60, duration: 2.4, ease: "power3.out" }, 0.4);
      }

      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          progress.current = self.progress;
        },
      });

      if (reduced) return;

      const scrub = { trigger: root.current, start: "top top", end: "bottom top", scrub: true };
      gsap.to(".hero-copy", { yPercent: -28, opacity: 0, ease: "none", scrollTrigger: scrub });
      gsap.to(".hero-watermark", { yPercent: 40, ease: "none", scrollTrigger: scrub });
      gsap.to(".hero-canvas", { yPercent: 12, ease: "none", scrollTrigger: scrub });
      gsap.to(".hero-glow-a", { yPercent: 30, scale: 1.2, ease: "none", scrollTrigger: scrub });

      // Pointer-driven depth layers (desktop only)
      if (window.matchMedia("(pointer: fine)").matches) {
        const layers = gsap.utils.toArray<HTMLElement>("[data-depth]").map((el) => ({
          depth: Number(el.dataset.depth),
          x: gsap.quickTo(el, "x", { duration: 1.2, ease: "power3.out" }),
          y: gsap.quickTo(el, "y", { duration: 1.2, ease: "power3.out" }),
        }));
        const onMove = (e: PointerEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          layers.forEach((l) => {
            l.x(nx * l.depth);
            l.y(ny * l.depth);
          });
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        return () => window.removeEventListener("pointermove", onMove);
      }
    },
    { scope: root }
  );

  return (
    <section
      id="top"
      ref={root}
      className="relative flex min-h-[100svh] items-end overflow-hidden pb-14 pt-20 lg:items-center lg:pb-0 lg:pt-28"
    >
      {/* Layer 1 — atmosphere */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div data-depth="-30" className="absolute inset-0">
          <div className="hero-glow hero-glow-a absolute left-1/2 top-[26%] h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember/20 blur-[120px] lg:left-[68%] lg:top-1/2" />
          <div className="hero-glow absolute left-[12%] top-[70%] h-[40vmin] w-[40vmin] rounded-full bg-gold/10 blur-[110px]" />
        </div>
        {/* Layer 2 — giant watermark year */}
        <div
          data-depth="-14"
          className="hero-watermark absolute right-[-4vw] top-[8%] select-none font-display text-[34vw] font-light leading-none tracking-tighter text-transparent [-webkit-text-stroke:1px_rgba(217,165,74,0.09)] lg:right-[2vw] lg:top-[4%] lg:text-[24vw]"
        >
          1986
        </div>
      </div>

      {/* Layer 3 — 3D */}
      <div className="hero-canvas absolute inset-0">
        {quality?.webgl && (
          <SceneBoundary fallback={<Fallback />}>
            <HeroScene progress={progress} quality={quality} />
          </SceneBoundary>
        )}
        {quality && !quality.webgl && <Fallback />}
      </div>

      {/* Layer 4 — vignette & floor fade */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,#0b0907_100%)]" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ink/80 to-transparent" />
      </div>

      {/* Layer 5 — copy */}
      <div className="hero-copy pointer-events-none relative z-10 mx-auto w-full max-w-7xl px-6 pt-[34svh] lg:px-10 lg:pt-0">
        <div className="max-w-xl">
          <p className="hero-eyebrow mb-6 inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-gold">
            <span className="h-px w-8 bg-gold" /> Est. 1986 · Oak-Smoked
            <span className="hidden sm:inline"> · Austin, TX</span>
          </p>
          <h1 className="font-display text-[clamp(3.1rem,8vw,6.5rem)] font-light leading-[0.95] tracking-tight" aria-label="Smoked low. Served bold.">
            {HEADLINE.map((line, i) => (
              <span key={i} className="block overflow-hidden pb-[0.12em]" aria-hidden>
                {line.map((w, j) => (
                  <span key={j} className="inline-block">
                    <span
                      className={`hero-word inline-block will-change-transform ${w.gold ? "text-gradient-gold font-normal italic" : ""}`}
                    >
                      {w.text}
                    </span>
                    {j < line.length - 1 && " "}
                  </span>
                ))}
              </span>
            ))}
          </h1>
          <p className="hero-fade mt-6 max-w-md text-base leading-relaxed text-smoke md:text-lg">
            Dry-aged smash burgers and 14-hour brisket, kissed by post-oak fire. Four decades of pitmaster craft in
            every bite.
          </p>
          <div className="hero-fade pointer-events-auto mt-9 flex flex-wrap items-center gap-3 sm:gap-4">
            <Magnetic>
              <button
                onClick={() => scrollToId("order")}
                className="btn-shine group relative inline-flex items-center gap-2 rounded-full bg-ember px-7 py-4 text-sm font-bold uppercase tracking-wider text-ink shadow-[0_10px_40px_-10px_rgba(255,122,26,0.6)] transition-[background-color,box-shadow] duration-500 hover:bg-flame hover:shadow-[0_0_50px_rgba(255,122,26,0.55)]"
              >
                Order Online
                <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
              </button>
            </Magnetic>
            <Magnetic strength={0.25}>
              <button
                onClick={() => scrollToId("menu")}
                className="rounded-full border border-cream/20 px-7 py-4 text-sm font-semibold uppercase tracking-wider text-cream backdrop-blur-sm transition-colors duration-500 hover:border-gold hover:bg-gold/5 hover:text-gold"
              >
                Explore Menu
              </button>
            </Magnetic>
          </div>
          <div className="hero-fade mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-smoke">
            <div>
              <span className="text-gold">★★★★★</span>
              <span className="ml-2 font-semibold text-cream">4.9</span> / 12k reviews
            </div>
            <span className="hidden h-4 w-px bg-cream/20 sm:block" />
            <div>Delivery in ~30 min</div>
          </div>
        </div>
      </div>

      {/* Hints */}
      <div className="hero-fade pointer-events-none absolute bottom-24 right-6 z-10 hidden items-center gap-2 rounded-full glass px-4 py-2 text-xs text-smoke lg:right-[14vw] lg:flex">
        <span className="relative h-2 w-2 rounded-full bg-ember pulse-ring" /> Click the burger to deconstruct it
      </div>
      <button
        onClick={() => scrollToId("story")}
        aria-label="Scroll to story"
        className="hero-fade absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-smoke md:flex"
      >
        Scroll
        <span className="relative block h-10 w-px overflow-hidden bg-cream/15">
          <span className="absolute inset-x-0 top-0 h-1/2 animate-[drip_2s_ease-in-out_infinite] bg-gold" />
        </span>
      </button>
    </section>
  );
}
