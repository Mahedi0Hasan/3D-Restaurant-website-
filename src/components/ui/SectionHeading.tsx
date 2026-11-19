interface Props {
  eyebrow: string;
  title: React.ReactNode;
  intro?: string;
  align?: "left" | "center";
}

export default function SectionHeading({ eyebrow, title, intro, align = "left" }: Props) {
  const center = align === "center";
  return (
    <div className={`max-w-2xl ${center ? "mx-auto text-center" : ""}`}>
      <p
        data-reveal
        className={`mb-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-gold ${
          center ? "justify-center" : ""
        }`}
      >
        <span className="h-px w-8 bg-gold" />
        {eyebrow}
        {center && <span className="h-px w-8 bg-gold" />}
      </p>
      <h2 data-reveal="heading" className="font-display text-[clamp(2.25rem,5vw,4rem)] font-light leading-[1.02] tracking-tight">
        {title}
      </h2>
      {intro && (
        <p data-reveal className="mt-5 text-base leading-relaxed text-smoke md:text-lg">
          {intro}
        </p>
      )}
    </div>
  );
}
