import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { hero, site } from "@/lib/content";
import HeroPreview from "./HeroPreview";

const TYPE_MS_PER_CHAR = 38;
const TYPE_GAP_MS = 90;
const TYPE_START_MS = 280;

export default function Hero() {
  // Sequential line delays make the four lines type one after another.
  const typedLines = hero.lines.map((line, index) => {
    const isLast = index === hero.lines.length - 1;
    const chars = line.length + (isLast ? 1 : 0); // accent dot counts as a character
    const duration = chars * TYPE_MS_PER_CHAR;
    const delay =
      TYPE_START_MS +
      hero.lines
        .slice(0, index)
        .reduce(
          (sum, previous) => sum + previous.length * TYPE_MS_PER_CHAR + TYPE_GAP_MS,
          0
        );
    return { line, isLast, chars, duration, delay };
  });

  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="container hero-inner">
        <div>
          <p className="label hero-eyebrow">{site.eyebrow}</p>

          <h1 className="display hero-title" id="hero-title">
            {typedLines.map(({ line, isLast, chars, duration, delay }) => (
              <span
                className={`hero-line${isLast ? " hero-line--last" : ""}`}
                key={line}
              >
                <span
                  className="hero-line-text"
                  style={{
                    "--chars": String(chars),
                    "--duration": `${duration}ms`,
                    "--delay": `${delay}ms`,
                  }}
                >
                  {line}
                  {isLast ? (
                    <span className="accent-dot" aria-hidden="true">
                      .
                    </span>
                  ) : null}
                </span>
              </span>
            ))}
          </h1>
        </div>

        <div className="hero-stage">
          <div className="hero-stage-copy">
            <div className="hero-actions">
              <Link className="btn btn--accent" href="/#contact">
                Start a project
                <ArrowUpRight size={15} strokeWidth={1.8} aria-hidden="true" />
              </Link>
              <Link className="btn btn--outline" href="/#work">
                Explore our work
                <ArrowDown size={15} strokeWidth={1.8} aria-hidden="true" />
              </Link>
            </div>

            <p className="body-lg hero-note">{hero.subhead}</p>

            <div className="hero-trust-bar">
              {hero.trustSignals.map((signal) => (
                <span key={signal}>
                  <span className="trust-check" aria-hidden="true">
                    ✓
                  </span>
                  {signal}
                </span>
              ))}
            </div>
          </div>

          <HeroPreview />
        </div>

        <div className="hero-foot">
          <div>
            <span>Web design &amp; development</span>
            <span aria-hidden="true">/</span>
            <span>{site.location}</span>
          </div>
          <div>
            <span className="status-dot" aria-hidden="true" />
            <span>{site.availability}</span>
          </div>
          <div>
            <span>Scroll</span>
            <span className="scroll-cue" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}
