import { whyUs } from "@/lib/content";
import Reveal from "./Reveal";

export default function WhyUs() {
  return (
    <section className="section section--tight" aria-labelledby="why-title">
      <div className="container">
        <div className="section-head">
          <Reveal>
            <p className="label">Why work with us</p>
            <h2 className="section-title" id="why-title">
              Good work. Clear communication. No unnecessary complexity.
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="body-lg">
              A small studio with a clear way of working: understand the goal,
              make thoughtful choices, and build something that lasts.
            </p>
          </Reveal>
        </div>

        <div>
          {whyUs.map((item, index) => (
            <Reveal
              as="article"
              className="why-row"
              key={item.number}
              style={{ "--delay": `${index * 80}ms` }}
            >
              <span className="why-number">{item.number}</span>
              <h3 className="why-title">{item.title}</h3>
              <p className="why-desc">{item.description}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
