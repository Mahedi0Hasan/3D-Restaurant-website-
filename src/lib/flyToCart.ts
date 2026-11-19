import gsap from "gsap";
import { prefersReducedMotion } from "./scroll";

/**
 * Animates a small copy of the dish photo from `origin` into the header cart button.
 * Looks for the nearest [data-fly-img] image around the origin element.
 */
export function flyToCart(origin: Element | null) {
  if (!origin || typeof window === "undefined" || prefersReducedMotion()) return;
  const target = document.getElementById("cart-button");
  const scope = origin.closest("[data-fly-scope]") ?? origin;
  const img = scope.querySelector<HTMLImageElement>("[data-fly-img] img");
  if (!target) return;

  const from = (img && img.complete && img.naturalWidth ? img : origin).getBoundingClientRect();
  const to = target.getBoundingClientRect();
  const size = 64;

  const ghost = document.createElement("div");
  ghost.setAttribute("aria-hidden", "true");
  Object.assign(ghost.style, {
    position: "fixed",
    left: `${from.left + from.width / 2 - size / 2}px`,
    top: `${from.top + from.height / 2 - size / 2}px`,
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: "9999px",
    zIndex: "80",
    pointerEvents: "none",
    boxShadow: "0 0 40px rgba(255,122,26,0.6)",
    background: img?.naturalWidth
      ? `center / cover no-repeat url("${img.currentSrc || img.src}")`
      : "radial-gradient(circle, #ffb066, #ff7a1a)",
    border: "2px solid #ff7a1a",
  } as CSSStyleDeclaration);
  document.body.appendChild(ghost);

  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);

  gsap
    .timeline({ onComplete: () => ghost.remove() })
    .fromTo(ghost, { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.18, ease: "power2.out" })
    .to(ghost, { x: dx, duration: 0.75, ease: "power2.inOut" }, 0.12)
    .to(ghost, { y: dy, duration: 0.75, ease: "back.in(1.4)" }, 0.12)
    .to(ghost, { scale: 0.25, opacity: 0.2, duration: 0.3, ease: "power2.in" }, 0.62);
}
