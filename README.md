# SMOKEHOUSE 1986 — SmartOrder 3D Restaurant Demo

A premium, cinematic 3D restaurant website for a fictional burgers & BBQ house, built by **SmartOrder BD** as a portfolio demo.

## Stack
Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Three.js · React Three Fiber + Drei · GSAP (ScrollTrigger) · Lenis smooth scroll

## Sections
1. **Cinematic 3D hero**: a procedurally modelled burger with warm lighting, rising embers, and mouse parallax. Click the burger to deconstruct it; it also separates layer by layer as you scroll.
2. **Story**: parallax images and animated stat counters
3. **Signature menu**: tabbed categories with an animated indicator and add-to-cart
4. **Interactive food cards**: 3D tilt with glare, tap to flip for ingredients, smoke time, and heat level
5. **Special offers**: live countdown and copyable promo codes (`PITMASTER20`, `SMOKE1986`, `FIRSTBITE`)
6. **Reviews**: rating breakdown and a dual marquee
7. **Online order**: cart (saved in localStorage), delivery/pickup toggle, validated checkout form, promo codes, tax and delivery maths, and a demo confirmation
8. **Contact & footer**: hours with a live "open now" badge, a reservation form, and a newsletter signup

## Run locally
```bash
npm install
npm run dev     # http://localhost:3000
npm run build && npm start
```

## Deploy on Vercel
Import this GitHub repo in Vercel. The framework (Next.js) is detected automatically, so no environment variables or settings are needed.

## Customise
- Menu items, prices, and photos: `src/data/menu.ts`
- Promo codes: `src/lib/promos.ts`
- Colours and fonts: `src/app/globals.css` (`@theme` block)
- 3D burger: `src/components/three/Burger.tsx`

Food photography is loaded from Unsplash. If an image fails to load, a styled fallback is shown instead.
Checkout and the forms are demo only: nothing is charged or sent.
