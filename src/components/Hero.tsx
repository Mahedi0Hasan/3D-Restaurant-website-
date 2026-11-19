"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { scrollToId } from "@/lib/scroll";
import SmartImage from "./ui/SmartImage";
import { menu } from "@/data/menu";

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

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

function Fallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center lg:justify-end lg:pr-[8vw]">
      <SmartImage
        src={menu[0].image}
        alt="The 1986 burger"
        priority
        className="h-[46vh] w-[46vh] rounded-full opacity-90 shadow-[0_0_120px_rgba(255,122,26,0.35)]"
      />
    </div>
  );
}

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [webgl, setWebgl] = useState<boolean | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWebgl(hasWebGL());
  }, []);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.from(".hero-line > span", { yPercent: 110, duration: 1.3, stagger: 0.12, delay: 0.2 })
        .from(".hero-fade", { opacity: 0, y: 24, duration: 1, stagger: 0.1 }, "-=0.8")
        .from(".hero-glow", { opacity: 0, scale: 0.6, duration: 2 }, 0);

      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          progress.current = self.progress;
        },
      });

      gsap.to(".hero-copy", {
        yPercent: -30,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
    },
    { scope: root }
  );

  return (
    <section
      id="top"
      ref={root}
      className="relative flex min-h-[100svh] items-end overflow-hidden pb-14 pt-20 lg:items-center lg:pb-0 lg:pt-28"
    >
      {/* Background atmosphere */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="hero-glow absolute left-1/2 top-[30%] h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember/20 blur-[120px] lg:left-[68%] lg:top-1/2" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#0b0907_100%)]" />
      </div>

      {/* 3D */}
      <div className="absolute inset-0">
        {webgl === true && (
          <SceneBoundary fallback={<Fallback />}>
            <HeroScene progress={progress} />
          </SceneBoundary>
        )}
        {webgl === false && <Fallback />}
      </div>

      {/* Copy */}
      <div className="hero-copy pointer-events-none relative z-10 mx-auto w-full max-w-7xl px-6 pt-[34svh] lg:px-10 lg:pt-0">
        <div className="max-w-xl">
          <p className="hero-fade mb-6 inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-gold">
            <span className="h-px w-8 bg-gold" /> Est. 1986 · Oak-Smoked<span className="hidden sm:inline"> · Austin, TX</span>
          </p>
          <h1 className="font-display text-[clamp(3rem,8vw,6.5rem)] font-light leading-[0.92] tracking-tight">
            <span className="hero-line block overflow-hidden pb-2">
              <span className="block">Smoked low.</span>
            </span>
            <span className="hero-line block overflow-hidden pb-2">
              <span className="block">
                Served <em className="text-gradient-gold font-normal">bold.</em>
              </span>
            </span>
          </h1>
          <p className="hero-fade mt-6 max-w-md text-base leading-relaxed text-smoke md:text-lg">
            Dry-aged smash burgers and 14-hour brisket, kissed by post-oak fire. Four decades of pitmaster craft in
            every bite.
          </p>
          <div className="hero-fade pointer-events-auto mt-9 flex flex-wrap items-center gap-4">
            <button
              onClick={() => scrollToId("order")}
              className="group relative inline-flex items-center gap-2 rounded-full bg-ember px-7 py-4 text-sm font-bold uppercase tracking-wider text-ink transition hover:bg-flame hover:shadow-[0_0_40px_rgba(255,122,26,0.5)]"
            >
              Order Online
              <span className="transition group-hover:translate-x-1">→</span>
            </button>
            <button
              onClick={() => scrollToId("menu")}
              className="rounded-full border border-cream/20 px-7 py-4 text-sm font-semibold uppercase tracking-wider text-cream transition hover:border-gold hover:text-gold"
            >
              Explore Menu
            </button>
          </div>
          <div className="hero-fade mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-smoke">
            <div>
              <span className="text-gold">★★★★★</span>
              <span className="ml-2 font-semibold text-cream">4.9</span> / 12k reviews
            </div>
            <span className="h-4 w-px bg-cream/20" />
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
