import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { site } from "@/lib/content";
import Reveal from "./Reveal";

export default function FinalCTA() {
  return (
    <section className="section final-cta dark-scope" aria-labelledby="final-title">
      <div className="container">
        <Reveal>
          <p className="label">Your next step</p>
          <h2 className="final-title" id="final-title">
            <span className="mask-reveal">
              <span style={{ "--delay": "0ms" }}>Have a good idea?</span>
            </span>
            <span className="mask-reveal">
              <span style={{ "--delay": "110ms" }}>
                Let&apos;s make it real<span className="accent-dot">.</span>
              </span>
            </span>
          </h2>
        </Reveal>

        <div className="final-bottom">
          <Reveal delay={220}>
            <p className="body-lg">
              Tell us what you&apos;re building. We&apos;ll help you figure out
              the right way to bring it online.
            </p>
          </Reveal>
          <Reveal className="final-actions" delay={340}>
            <Link className="btn btn--accent" href="/#contact">
              Start a project
              <ArrowUpRight size={15} strokeWidth={1.8} aria-hidden="true" />
            </Link>
            <a
              className="btn btn--outline"
              href={site.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp us
              <ArrowUpRight size={15} strokeWidth={1.8} aria-hidden="true" />
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
