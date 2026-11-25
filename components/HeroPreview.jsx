"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { hero } from "@/lib/content";

const HOLD_MS = 5200;
const FLIP_MS = 950;

/**
 * Decorative hero stage: a slow stack-flip of real inner-page screenshots.
 * Purely presentational — the real work lives in the Selected Work section.
 */
export default function HeroPreview() {
  const count = hero.screenshots.length;
  const [active, setActive] = useState(0);
  const [leaving, setLeaving] = useState(null);
  const [paused, setPaused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setReduceMotion(query.matches);
    const syncVisibility = () => setHidden(document.hidden);

    syncMotion();
    syncVisibility();
    query.addEventListener("change", syncMotion);
    document.addEventListener("visibilitychange", syncVisibility);

    return () => {
      query.removeEventListener("change", syncMotion);
      document.removeEventListener("visibilitychange", syncVisibility);
    };
  }, []);

  useEffect(() => {
    if (paused || hidden || reduceMotion || count < 2) return undefined;

    const timer = window.setInterval(() => {
      setLeaving(active);
      setActive((current) => (current + 1) % count);
    }, HOLD_MS);

    return () => window.clearInterval(timer);
  }, [active, count, hidden, paused, reduceMotion]);

  useEffect(() => {
    if (leaving === null) return undefined;
    const timer = window.setTimeout(() => setLeaving(null), FLIP_MS + 80);
    return () => window.clearTimeout(timer);
  }, [leaving]);

  return (
    <div
      className="hero-preview"
      aria-hidden="true"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="hero-flip-stage">
        <div className="hero-flip">
          {hero.screenshots.map((shot, index) => (
            <div
              className={`hero-flip-card${index === active ? " is-current" : ""}${
                index === leaving ? " is-leaving" : ""
              }`}
              key={shot.src}
            >
              <Image
                src={shot.src}
                alt=""
                fill
                priority={index === 0}
                sizes="(min-width: 1200px) 42vw, 90vw"
              />
              <span className="hero-flip-label">{shot.label}</span>
            </div>
          ))}
        </div>
        <span className="hero-flip-count">
          0{active + 1} / 0{count}
        </span>
      </div>

      <div className="hero-preview-phone">
        <div className="hero-preview-phone-notch" />
        <div className="hero-preview-phone-screen">
          <span className="phone-brand" />
          <span className="phone-hero" />
          <span className="phone-line" />
          <span className="phone-line phone-line--short" />
          <span className="phone-cta" />
        </div>
      </div>

      <span className="hero-preview-tag">
        <span className="status-dot" />
        Custom build · No templates
      </span>
    </div>
  );
}
