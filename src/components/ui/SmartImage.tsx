"use client";

import { useState } from "react";

interface Props {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  /** Show the dish name on the fallback when the photo fails (off for thumbnails). */
  showLabel?: boolean;
}

/**
 * Remote food photo with a graceful fallback: if the image fails to load,
 * a warm ember gradient with the dish name is shown instead of a broken icon.
 */
export default function SmartImage({ src, alt, className = "", priority = false, showLabel = true }: Props) {
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");

  return (
    <div className={`relative overflow-hidden bg-char ${className}`}>
      {state !== "ok" && (
        <div
          aria-hidden
          className={`absolute inset-0 flex items-end p-4 ${state === "loading" ? "animate-pulse" : ""}`}
          style={{
            background:
              "radial-gradient(120% 90% at 70% 20%, rgba(255,122,26,0.35), transparent 60%), radial-gradient(90% 80% at 10% 100%, rgba(217,165,74,0.25), transparent 60%), #1c1814",
          }}
        >
          {state === "error" && showLabel && (
            <span className="font-display text-lg italic text-cream/70">{alt}</span>
          )}
        </div>
      )}
      {state !== "error" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setState("ok")}
          onError={() => setState("error")}
          className={`h-full w-full object-cover transition-opacity duration-700 ${state === "ok" ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </div>
  );
}
