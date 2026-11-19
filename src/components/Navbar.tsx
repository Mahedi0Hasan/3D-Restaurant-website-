"use client";

import { useEffect, useState } from "react";
import { scrollToId, getLenis } from "@/lib/scroll";
import { useCart } from "@/context/CartContext";

export const NAV = [
  { id: "story", label: "Story" },
  { id: "menu", label: "Menu" },
  { id: "signatures", label: "Signatures" },
  { id: "offers", label: "Offers" },
  { id: "reviews", label: "Reviews" },
  { id: "contact", label: "Contact" },
];

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden>
        <circle cx="16" cy="16" r="15" fill="none" stroke="#d9a54a" strokeWidth="1.2" />
        <path
          d="M16 6c2.5 3.2 5.5 5.6 5.5 10a5.5 5.5 0 0 1-11 0c0-2.4 1.1-3.8 2.3-5.2.2 1.6.9 2.7 2 3.2-.4-2.8.2-5.4 1.2-8Z"
          fill="#ff7a1a"
        />
      </svg>
      <span className="leading-none">
        <span className="block font-display text-lg font-semibold tracking-wide">SMOKEHOUSE</span>
        <span className="block text-[9px] font-semibold tracking-[0.5em] text-gold">EST · 1986</span>
      </span>
    </span>
  );
}

export default function Navbar() {
  const { count, setOpen, lastAdded } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [bump, setBump] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setActive(e.target.id));
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    [...NAV.map((n) => n.id), "order", "top"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!lastAdded) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBump(true);
    const t = setTimeout(() => setBump(false), 450);
    return () => clearTimeout(t);
  }, [lastAdded]);

  useEffect(() => {
    const l = getLenis();
    if (menuOpen) l?.stop();
    else l?.start();
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  const go = (id: string) => {
    setMenuOpen(false);
    setTimeout(() => scrollToId(id), menuOpen ? 250 : 0);
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled ? "glass border-x-0 border-t-0 py-3" : "py-5"
        }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-10" aria-label="Main">
          <button onClick={() => go("top")} aria-label="Smokehouse 1986 — back to top">
            <Logo />
          </button>

          <ul className="hidden items-center gap-1 lg:flex">
            {NAV.map((n) => (
              <li key={n.id}>
                <a
                  href={`#${n.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    go(n.id);
                  }}
                  className={`relative rounded-full px-4 py-2 text-[13px] font-medium tracking-wide transition ${
                    active === n.id ? "text-gold" : "text-cream/75 hover:text-cream"
                  }`}
                >
                  {n.label}
                  <span
                    className={`absolute inset-x-4 -bottom-0.5 h-px origin-left bg-gold transition-transform duration-500 ${
                      active === n.id ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              aria-label={`Open cart, ${count} items`}
              className={`relative flex h-11 w-11 items-center justify-center rounded-full border border-cream/15 transition hover:border-gold ${
                bump ? "scale-110 border-ember" : ""
              }`}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M5 7h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 7Z" />
                <path d="M9 7a3 3 0 0 1 6 0" />
              </svg>
              {count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-ember px-1 text-[10px] font-bold text-ink">
                  {count}
                </span>
              )}
            </button>
            <button
              onClick={() => go("order")}
              className="hidden rounded-full bg-ember px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-ink transition hover:bg-flame sm:block"
            >
              Order Now
            </button>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-full border border-cream/15 lg:hidden"
            >
              <span className={`h-px w-5 bg-cream transition ${menuOpen ? "translate-y-[3.5px] rotate-45" : ""}`} />
              <span className={`h-px w-5 bg-cream transition ${menuOpen ? "-translate-y-[3.5px] -rotate-45" : ""}`} />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-40 bg-ink/97 backdrop-blur-xl transition-all duration-500 lg:hidden ${
          menuOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <ul className="flex h-full flex-col justify-center gap-2 px-8">
          {[...NAV, { id: "order", label: "Order Online" }].map((n, i) => (
            <li
              key={n.id}
              style={{ transitionDelay: menuOpen ? `${80 + i * 50}ms` : "0ms" }}
              className={`transition-all duration-500 ${menuOpen ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
            >
              <a
                href={`#${n.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  go(n.id);
                }}
                className={`font-display text-4xl font-light ${n.id === "order" ? "text-ember" : active === n.id ? "text-gold" : "text-cream"}`}
              >
                {n.label}
              </a>
            </li>
          ))}
          <li className="mt-8 text-sm text-smoke">(512) 555-0186 · Open daily 11am – 11pm</li>
        </ul>
      </div>
    </>
  );
}
