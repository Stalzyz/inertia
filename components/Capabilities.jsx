import Image from "next/image";
import { capabilities } from "@/lib/content";
import Reveal from "./Reveal";

export default function Capabilities() {
  return (
    <section className="section section--tight" aria-labelledby="capabilities-title">
      <div className="container">
        <div className="section-head section-head--stack">
          <Reveal>
            <p className="label">The website experience</p>
            <h2 className="section-title" id="capabilities-title">
              A website should do more than exist.
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="body-lg">
              It should make your business easier to understand, easier to
              trust, and easier to choose.
            </p>
          </Reveal>
        </div>

        <div className="capabilities-list">
          {capabilities.map((capability, index) => (
            <Reveal
              className={`capability${
                index % 2 === 1 ? " capability--flip" : ""
              }`}
              key={capability.number}
              delay={index * 80}
            >
              <div className="capability-copy">
                <span className="capability-number">{capability.number}</span>
                <h3 className="capability-title">{capability.title}</h3>
                <p className="body-md">{capability.description}</p>
                <ul className="capability-points">
                  {capability.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
              <div className="capability-visual" aria-hidden="true">
                <div className="capability-shots">
                  {capability.screenshots.map((src) => (
                    <span className="capability-shot" key={src}>
                      <Image
                        src={src}
                        alt=""
                        fill
                        sizes="(max-width: 700px) 44vw, 22vw"
                      />
                    </span>
                  ))}
                </div>
                <span className="capability-visual-label">Live builds / inner pages</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
