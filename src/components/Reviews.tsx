import SectionHeading from "./ui/SectionHeading";

const reviews = [
  { name: "Jordan M.", where: "Google", rating: 5, text: "The brisket is unreal. Pink smoke ring, peppery bark, melts like butter. Best I've had outside of Texas Hill Country." },
  { name: "Priya S.", where: "Yelp", rating: 5, text: "The 1986 burger lives up to the hype. That onion jam! Ordered online, arrived hot in 25 minutes." },
  { name: "Marcus T.", where: "Google", rating: 5, text: "Took my dad for his birthday. The tomahawk was a showstopper and the staff made us feel like regulars." },
  { name: "Elena R.", where: "TripAdvisor", rating: 5, text: "Moody, warm, smells like a campfire in the best way. The burnt caramel shake is dangerous." },
  { name: "Dev K.", where: "Google", rating: 4, text: "Ribs fall off the bone and the coffee molasses glaze is something special. Gets busy, so book ahead." },
  { name: "Sam W.", where: "Yelp", rating: 5, text: "Beef-tallow fries ruined all other fries for me. The ordering flow on the site is super smooth too." },
  { name: "Aisha B.", where: "Google", rating: 5, text: "Garden Smoke burger is the best veggie burger I've had. Finally a BBQ place that cares about vegetarians." },
  { name: "Chris L.", where: "TripAdvisor", rating: 5, text: "We came for the brisket and stayed for the skillet cookie. Absolutely worth the drive." },
];

const dist = [
  { stars: 5, pct: 91 },
  { stars: 4, pct: 7 },
  { stars: 3, pct: 1 },
  { stars: 2, pct: 1 },
  { stars: 1, pct: 0 },
];

function Card({ r }: { r: (typeof reviews)[number] }) {
  return (
    <figure className="w-[300px] shrink-0 rounded-3xl border border-cream/8 bg-coal p-7 md:w-[380px]">
      <div className="text-gold" aria-label={`${r.rating} out of 5 stars`}>
        {"★".repeat(r.rating)}
        <span className="text-cream/20">{"★".repeat(5 - r.rating)}</span>
      </div>
      <blockquote className="mt-4 font-display text-lg font-light leading-snug text-cream/90">“{r.text}”</blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-ember to-gold text-sm font-bold text-ink">
          {r.name[0]}
        </span>
        <span>
          <span className="block text-sm font-semibold">{r.name}</span>
          <span className="block text-xs text-smoke">via {r.where}</span>
        </span>
      </figcaption>
    </figure>
  );
}

export default function Reviews() {
  const rowA = reviews.slice(0, 4);
  const rowB = reviews.slice(4);
  return (
    <section id="reviews" className="relative overflow-hidden py-28 md:py-36">
      <div aria-hidden className="absolute inset-x-0 top-0 hairline" />
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:px-10">
        <SectionHeading
          eyebrow="Guest reviews"
          title={
            <>
              Twelve thousand guests <em className="text-gradient-gold">can&apos;t be wrong.</em>
            </>
          }
        />
        <div data-reveal className="flex items-center gap-8 rounded-3xl border border-cream/10 bg-coal p-7">
          <div className="text-center">
            <div className="font-display text-6xl font-light">4.9</div>
            <div className="text-gold">★★★★★</div>
            <div className="mt-1 text-xs text-smoke">12,480 reviews</div>
          </div>
          <div className="flex-1 space-y-2">
            {dist.map((d) => (
              <div key={d.stars} className="flex items-center gap-3 text-xs text-smoke">
                <span className="w-3">{d.stars}</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-cream/10">
                  <span className="block h-full rounded-full bg-gradient-to-r from-ember to-gold" style={{ width: `${d.pct}%` }} />
                </span>
                <span className="w-8 text-right">{d.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pause-on-hover mt-16 space-y-6 [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
        <div className="flex">
          <div className="animate-marquee-slow flex w-max gap-6 pr-6">
            {[...rowA, ...rowA].map((r, i) => (
              <Card key={i} r={r} />
            ))}
          </div>
        </div>
        <div className="flex">
          <div className="animate-marquee-slow flex w-max gap-6 pr-6 [animation-direction:reverse]">
            {[...rowB, ...rowB].map((r, i) => (
              <Card key={i} r={r} />
            ))}
          </div>
        </div>
      </div>
      <p className="mt-8 text-center text-[11px] uppercase tracking-widest text-smoke/60">Sample reviews · demo content</p>
    </section>
  );
}
