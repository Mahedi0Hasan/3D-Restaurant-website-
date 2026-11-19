"use client";

import { useEffect, useState } from "react";
import { getLenis } from "@/lib/scroll";

const SLOTS = ["5:00 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:30 PM", "9:00 PM"];
const GUESTS = [1, 2, 3, 4, 5, 6, 8, 10];

interface Form {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  occasion: string;
  message: string;
}

type Errors = Partial<Record<keyof Form, string>>;

const empty: Form = { name: "", email: "", phone: "", date: "", time: "", guests: 2, occasion: "", message: "" };

const isoDate = (d: Date) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
};

function validate(f: Form, today: string): Errors {
  const e: Errors = {};
  if (f.name.trim().length < 2) e.name = "Please enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = "Enter a valid email address.";
  if (f.phone && f.phone.replace(/\D/g, "").length < 7) e.phone = "That phone number looks too short.";
  if (!f.date) e.date = "Pick a date.";
  else if (today && f.date < today) e.date = "Choose today or a future date.";
  if (!f.time) e.time = "Pick a time.";
  return e;
}

const input =
  "w-full rounded-2xl border bg-ink/60 px-4 py-3.5 text-sm text-cream placeholder:text-smoke/50 outline-none transition focus:ring-2";
const ok = "border-cream/10 focus:border-gold focus:ring-gold/20";
const bad = "border-ember/70 focus:ring-ember/20";
const label = "mb-2 block text-xs font-semibold uppercase tracking-widest text-smoke";

export default function Reservation() {
  const [form, setForm] = useState<Form>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [today, setToday] = useState("");
  const [maxDate, setMaxDate] = useState("");

  useEffect(() => {
    const now = new Date();
    const max = new Date();
    max.setDate(max.getDate() + 60);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToday(isoDate(now));
    setMaxDate(isoDate(max));
  }, []);

  const update = <K extends keyof Form>(k: K, v: Form[K]) => {
    const next = { ...form, [k]: v };
    setForm(next);
    if (touched) setErrors(validate(next, today));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    const errs = validate(form, today);
    setErrors(errs);
    const first = Object.keys(errs)[0];
    if (first) {
      document.getElementById(`r-${first}`)?.focus();
      return;
    }
    setState("sending");
    setTimeout(() => {
      setState("done");
      // keep the confirmation in view after the taller form collapses
      requestAnimationFrame(() => {
        const el = document.getElementById("reserve");
        if (!el || el.getBoundingClientRect().top > 80) return;
        const lenis = getLenis();
        if (lenis) lenis.scrollTo(el, { offset: -96 });
        else el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }, 1200);
  };

  const err = (k: keyof Form) =>
    errors[k] ? (
      <p id={`r-${k}-err`} className="mt-1.5 text-xs text-ember">
        {errors[k]}
      </p>
    ) : null;

  const prettyDate = form.date
    ? new Date(`${form.date}T12:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
    : "";

  return (
    <div id="reserve" className="scroll-mt-24 rounded-[2rem] border border-cream/10 bg-coal p-5 sm:p-6 md:p-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-3xl font-light">Reserve a table</h3>
          <p className="mt-2 text-sm text-smoke">Dinner service 5pm – 10pm · parties up to 10 online.</p>
        </div>
        <span className="rounded-full border border-gold/40 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gold">
          Demo booking
        </span>
      </div>

      {state === "done" ? (
        <div className="mt-8 animate-[fade-up_0.5s_ease-out] rounded-3xl border border-gold/30 bg-ink/50 p-6 text-center sm:p-8" role="status">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold text-2xl text-ink">✓</div>
          <p className="mt-5 font-display text-2xl">Request looks good, {form.name.split(" ")[0]}</p>
          <dl className="mx-auto mt-6 grid max-w-sm grid-cols-3 gap-3 text-sm">
            <div className="rounded-2xl bg-coal p-3">
              <dt className="text-[10px] uppercase tracking-widest text-smoke">Guests</dt>
              <dd className="mt-1 font-display text-lg">{form.guests}</dd>
            </div>
            <div className="col-span-2 rounded-2xl bg-coal p-3">
              <dt className="text-[10px] uppercase tracking-widest text-smoke">When</dt>
              <dd className="mt-1 font-display text-lg">
                {prettyDate.split(",")[0]}, {form.time}
              </dd>
            </div>
          </dl>
          <p className="mx-auto mt-6 max-w-sm text-xs leading-relaxed text-smoke/80">
            This is a demo. No reservation was made and nothing was sent to the restaurant. A live version would send a
            confirmation to {form.email}.
          </p>
          <button
            type="button"
            onClick={() => {
              setState("idle");
              setForm(empty);
              setTouched(false);
              setErrors({});
            }}
            className="mt-6 text-xs font-bold uppercase tracking-wider text-ember hover:text-flame"
          >
            Make another request
          </button>
        </div>
      ) : (
        <form onSubmit={submit} noValidate aria-label="Reservation request" className="mt-8 space-y-6">
          {/* Guests */}
          <fieldset className="min-w-0">
            <legend className={label}>Guests *</legend>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-8" role="radiogroup">
              {GUESTS.map((g) => (
                <button
                  key={g}
                  type="button"
                  role="radio"
                  aria-checked={form.guests === g}
                  onClick={() => update("guests", g)}
                  className={`h-11 rounded-full text-sm font-semibold tabular-nums transition ${
                    form.guests === g ? "bg-ember text-ink" : "bg-ink/60 text-cream/80 ring-1 ring-cream/10 hover:ring-gold/50"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="r-date" className={label}>
                Date *
              </label>
              <input
                id="r-date"
                type="date"
                min={today || undefined}
                max={maxDate || undefined}
                value={form.date}
                onChange={(e) => update("date", e.target.value)}
                aria-invalid={!!errors.date}
                aria-describedby={errors.date ? "r-date-err" : undefined}
                className={`${input} ${errors.date ? bad : ok} [color-scheme:dark]`}
              />
              {err("date")}
            </div>
            <div>
              <label htmlFor="r-occasion" className={label}>
                Occasion
              </label>
              <select
                id="r-occasion"
                value={form.occasion}
                onChange={(e) => update("occasion", e.target.value)}
                className={`${input} ${ok}`}
              >
                <option value="">None</option>
                <option>Birthday</option>
                <option>Anniversary</option>
                <option>Business dinner</option>
                <option>Date night</option>
              </select>
            </div>
          </div>

          {/* Time */}
          <fieldset className="min-w-0">
            <legend className={label}>Time *</legend>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" role="radiogroup" aria-describedby={errors.time ? "r-time-err" : undefined}>
              {SLOTS.map((t, i) => (
                <button
                  key={t}
                  id={i === 0 ? "r-time" : undefined}
                  type="button"
                  role="radio"
                  aria-checked={form.time === t}
                  onClick={() => update("time", t)}
                  className={`h-11 rounded-xl text-xs font-semibold tabular-nums transition sm:text-sm ${
                    form.time === t
                      ? "bg-ember text-ink"
                      : `bg-ink/60 text-cream/80 ring-1 hover:ring-gold/50 ${errors.time ? "ring-ember/50" : "ring-cream/10"}`
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            {err("time")}
          </fieldset>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="r-name" className={label}>
                Name *
              </label>
              <input
                id="r-name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                autoComplete="name"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "r-name-err" : undefined}
                className={`${input} ${errors.name ? bad : ok}`}
              />
              {err("name")}
            </div>
            <div>
              <label htmlFor="r-email" className={label}>
                Email *
              </label>
              <input
                id="r-email"
                type="email"
                inputMode="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                autoComplete="email"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "r-email-err" : undefined}
                className={`${input} ${errors.email ? bad : ok}`}
              />
              {err("email")}
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="r-phone" className={label}>
                Phone <span className="normal-case tracking-normal text-smoke/60">(optional)</span>
              </label>
              <input
                id="r-phone"
                type="tel"
                inputMode="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                autoComplete="tel"
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? "r-phone-err" : undefined}
                className={`${input} ${errors.phone ? bad : ok}`}
              />
              {err("phone")}
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="r-message" className={label}>
                Notes
              </label>
              <textarea
                id="r-message"
                rows={3}
                value={form.message}
                onChange={(e) => update("message", e.target.value)}
                placeholder="Allergies, high chair, preferred seating…"
                className={`${input} ${ok}`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={state === "sending"}
            className="btn-shine flex h-14 w-full items-center justify-center gap-3 rounded-full bg-ember text-sm font-bold uppercase tracking-wider text-ink transition hover:bg-flame active:scale-[0.98] disabled:opacity-60"
          >
            {state === "sending" ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink border-t-transparent" /> Checking availability…
              </>
            ) : (
              <>Request reservation{form.time && form.date ? ` · ${form.guests} at ${form.time}` : ""}</>
            )}
          </button>
          <p className="text-center text-[11px] text-smoke/70">Demo form: no booking is made and nothing is sent.</p>
        </form>
      )}
    </div>
  );
}
