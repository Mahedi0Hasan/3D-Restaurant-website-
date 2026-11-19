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

## v2 premium upgrade
- **Hero:** ambient smoke, floating ingredients, a light that flickers like fire, depth layers that respond to the cursor, a headline that reveals word by word with a blur, and buttons that follow the cursor. On low-power devices and with reduced motion, the hero scales down automatically.
- **Scroll:** headlines reveal behind a mask, images open with a clip-path effect, and a background glow shifts per section.
- **Menu:** a product detail modal (it opens as a bottom sheet on mobile), a fly-to-cart animation, item counts on the category tabs, and an entrance animation for the cards.
- **Cart:** coupon state and pricing are shared between the drawer and checkout. The drawer shows the full total, a delivery/pickup switch, and a "clear all" button. Phones get a floating "View order" bar.
- **Coupons:** the code is validated, wrong codes get feedback, an "applied" chip with a remove button appears, and the discount waits until the order reaches the minimum spend. The applied code is remembered across visits. The "Apply" buttons in Offers add the code straight to the order.
- **Reservation:** guest and time-slot pickers, a date limited to today up to 60 days ahead, validation on each field, a loading state, and a clearly labelled demo confirmation.
- **Performance:** responsive Unsplash `srcset`/`sizes`, a preconnect to the image host, a lighter 3D scene on mobile and low-power devices, and support for `prefers-reduced-motion` everywhere.

## Needs a backend to go live
Order submission and payment, reservation booking and confirmation emails, newsletter signup, and server-side validation of coupons are all front-end demos for now.

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
