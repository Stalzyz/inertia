"use client";

import { useEffect, useRef, useState } from "react";
import { process } from "@/lib/content";
import Reveal from "./Reveal";

export default function Process() {
  const [active, setActive] = useState(0);
  const stepRefs = useRef([]);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      const marker = window.innerHeight * 0.45;
      let current = 0;
      stepRefs.current.forEach((element, index) => {
        if (element && element.getBoundingClientRect().top <= marker) {
          current = index;
        }
      });
      setActive(current);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        update();
        frame = 0;
      });
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className="section" id="process" aria-labelledby="process-title">
      <div className="container">
        <p className="label">How we work</p>

        <div className="process-grid">
          <div className="process-sticky">
            <Reveal>
              <h2 className="section-title" id="process-title">
                From the first idea to the final click.
              </h2>
              <p className="body-md" style={{ marginTop: 24, maxWidth: "38ch" }}>
                A clear, five-step process that keeps the work moving and keeps
                you in the loop.
              </p>

              <div className="process-current" aria-hidden="true">
                <span>0{active + 1}</span>
                <small>/ 0{process.length}</small>
              </div>

              <div
                className="progress-track"
                role="progressbar"
                aria-label="Process progress"
                aria-valuemin={1}
                aria-valuemax={process.length}
                aria-valuenow={active + 1}
              >
                <div
                  className="progress-fill"
                  style={{ width: `${((active + 1) / process.length) * 100}%` }}
                />
              </div>

              <p className="process-label-current" aria-live="polite">
                {process[active].title}
              </p>
            </Reveal>
          </div>

          <div className="process-list">
            {process.map((step, index) => (
              <article
                key={step.number}
                ref={(element) => {
                  stepRefs.current[index] = element;
                }}
                className={`process-step${
                  index < active ? " is-past" : ""
                }${index === active ? " is-active" : ""}`}
              >
                <span className="process-step-number">{step.number}</span>
                <div>
                  <h3 className="process-step-title">{step.title}</h3>
                  <p className="process-step-body">{step.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
