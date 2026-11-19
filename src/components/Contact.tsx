"use client";

import { useEffect, useState } from "react";
import SectionHeading from "./ui/SectionHeading";
import { Logo, NAV } from "./Navbar";
import { scrollToId } from "@/lib/scroll";
import Reservation from "./Reservation";

const hours = [
  { d: "Mon – Thu", h: "11:00 – 22:00", open: 11, close: 22, days: [1, 2, 3, 4] },
  { d: "Fri – Sat", h: "11:00 – 23:30", open: 11, close: 23.5, days: [5, 6] },
  { d: "Sunday", h: "12:00 – 21:00", open: 12, close: 21, days: [0] },
];

function useOpenNow() {
  const [open, setOpen] = useState<boolean | null>(null);
  useEffect(() => {
    const now = new Date();
    const day = now.getDay();
    const t = now.getHours() + now.getMinutes() / 60;
    const row = hours.find((h) => h.days.includes(day));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(!!row && t >= row.open && t < row.close);
  }, []);
  return open;
}

export function Contact() {
  const openNow = useOpenNow();
  return (
    <section id="contact" className="relative py-28 md:py-36">
      <div aria-hidden className="absolute inset-x-0 top-0 hairline" />
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeading
          eyebrow="Visit & contact"
          title={
            <>
              Pull up a chair <em className="text-gradient-gold">by the fire.</em>
            </>
          }
        />

        <div className="mt-12 grid gap-6 md:mt-14 lg:grid-cols-2 lg:gap-8">
          <div data-reveal className="space-y-6">
            {/* Stylised map */}
            <a
              href="https://www.google.com/maps/search/?api=1&query=Austin+TX"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block aspect-[16/9] overflow-hidden rounded-[2rem] border border-cream/10 bg-coal"
              aria-label="Open location in Google Maps"
            >
              <svg viewBox="0 0 400 225" className="absolute inset-0 h-full w-full" aria-hidden>
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M20 0H0V20" fill="none" stroke="rgba(244,236,224,0.05)" />
                  </pattern>
                </defs>
                <rect width="400" height="225" fill="url(#grid)" />
                <path d="M-10 160 C80 140 120 60 220 80 S360 40 420 70" stroke="rgba(217,165,74,0.35)" strokeWidth="10" fill="none" />
                <path d="M60 -10 L140 240" stroke="rgba(244,236,224,0.08)" strokeWidth="6" />
                <path d="M-10 40 L420 120" stroke="rgba(244,236,224,0.08)" strokeWidth="4" />
                <path d="M300 -10 L260 240" stroke="rgba(244,236,224,0.08)" strokeWidth="5" />
                <path d="M0 200 Q200 170 400 210" stroke="rgba(80,140,200,0.18)" strokeWidth="14" fill="none" />
              </svg>
              <div className="absolute left-[54%] top-[42%] -translate-x-1/2 -translate-y-full">
                <span className="relative flex h-4 w-4 items-center justify-center rounded-full bg-ember pulse-ring" />
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl glass px-5 py-3">
                <span className="text-sm">1986 Ember Lane, Austin, TX</span>
                <span className="text-xs font-bold uppercase tracking-wider text-ember transition group-hover:translate-x-1">Directions →</span>
              </div>
            </a>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-3xl border border-cream/10 bg-coal p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-smoke">Hours</h3>
                  {openNow !== null && (
                    <span className={`flex items-center gap-2 text-xs font-semibold ${openNow ? "text-green-400" : "text-smoke"}`}>
                      <span className={`h-2 w-2 rounded-full ${openNow ? "bg-green-400" : "bg-smoke"}`} />
                      {openNow ? "Open now" : "Closed now"}
                    </span>
                  )}
                </div>
                <dl className="mt-4 space-y-2 text-sm">
                  {hours.map((h) => (
                    <div key={h.d} className="flex justify-between">
                      <dt className="text-smoke">{h.d}</dt>
                      <dd>{h.h}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="rounded-3xl border border-cream/10 bg-coal p-6">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-smoke">Get in touch</h3>
                <ul className="mt-4 space-y-3 text-sm">
                  <li><a href="tel:+15125550186" className="hover:text-gold">(512) 555-0186</a></li>
                  <li><a href="mailto:hello@smokehouse1986.example" className="break-all hover:text-gold">hello@smokehouse1986.example</a></li>
                  <li className="text-smoke">Private events for up to 80 guests</li>
                </ul>
              </div>
            </div>
          </div>

          <div data-reveal>
            <Reservation />
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const year = 2026;
  return (
    <footer className="relative overflow-hidden border-t border-cream/10 pt-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-smoke">
              Oak-smoked burgers and Texas BBQ since 1986. Join the Smoke Club for early access to specials.
            </p>
            {joined ? (
              <p className="mt-6 text-sm text-gold" role="status">You&apos;re in. Welcome to the Smoke Club 🔥</p>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) setJoined(true);
                }}
                className="mt-6 flex max-w-sm gap-2"
              >
                <label htmlFor="news" className="sr-only">Email</label>
                <input
                  id="news"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  className="flex-1 rounded-full border border-cream/10 bg-coal px-5 py-3 text-sm outline-none focus:border-gold"
                />
                <button className="rounded-full bg-gold px-5 text-xs font-bold uppercase tracking-wider text-ink hover:bg-gold-soft">Join</button>
              </form>
            )}
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-smoke">Explore</h3>
            <ul className="mt-5 space-y-3 text-sm">
              {[...NAV, { id: "order", label: "Order Online" }].map((n) => (
                <li key={n.id}>
                  <a
                    href={`#${n.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToId(n.id);
                    }}
                    className="text-cream/80 hover:text-gold"
                  >
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-smoke">Follow</h3>
            <div className="mt-5 flex gap-3">
              {[
                { l: "Instagram", d: "M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm5 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm5.5-.5h.01" },
                { l: "Facebook", d: "M14 8h3V4h-3a4 4 0 0 0-4 4v2H8v4h2v6h4v-6h3l1-4h-4V8Z" },
                { l: "TikTok", d: "M15 3c.4 2.4 2 4 4.5 4.3V11c-1.7 0-3.2-.5-4.5-1.4V16a5 5 0 1 1-5-5v3.6a1.5 1.5 0 1 0 1.5 1.4V3H15Z" },
              ].map((s) => (
                <a
                  key={s.l}
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  aria-label={`${s.l} (demo link)`}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-cream/15 transition hover:border-gold hover:text-gold"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
                    <path d={s.d} />
                  </svg>
                </a>
              ))}
            </div>
            <button onClick={() => scrollToId("top")} className="mt-8 text-xs font-bold uppercase tracking-wider text-ember hover:text-flame">
              Back to top ↑
            </button>
          </div>
        </div>
      </div>

      <div aria-hidden className="mt-20 select-none whitespace-nowrap text-center font-display text-[18vw] font-light leading-[0.8] text-cream/[0.04]">
        SMOKEHOUSE
      </div>
      <div className="border-t border-cream/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-smoke md:flex-row lg:px-10">
          <span>© {year} Smokehouse 1986. Demo restaurant. Food photography via Unsplash.</span>
          <span>
            Designed &amp; built by <span className="font-semibold text-gold">SmartOrder BD</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
