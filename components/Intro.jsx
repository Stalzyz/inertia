import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Reveal from "./Reveal";

export default function Intro() {
  return (
    <section className="section" id="about" aria-labelledby="about-title">
      <div className="container">
        <p className="label">
          <Reveal as="span" className="reveal" delay={0}>
            A little about us
          </Reveal>
        </p>

        <div className="intro-grid">
          <Reveal>
            <h2 className="intro-title" id="about-title">
              <span className="mask-reveal">
                <span style={{ "--delay": "0ms" }}>
                  We don&apos;t just build websites.
                </span>
              </span>
              <span className="mask-reveal">
                <span style={{ "--delay": "110ms" }}>
                  We build the first impression
                </span>
              </span>
              <span className="mask-reveal">
                <span style={{ "--delay": "220ms" }}>
                  of your business.
                </span>
              </span>
            </h2>
          </Reveal>

          <Reveal className="intro-side" delay={180}>
            <p className="body-lg">
              Every business has something worth showing. We help bring it to
              life through thoughtful design, purposeful development, and
              digital experiences that make people take notice.
            </p>
            <Link className="text-link" href="/#process">
              How we work
              <ArrowUpRight size={14} strokeWidth={1.8} aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
