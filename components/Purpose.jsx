import { purpose } from "@/lib/content";
import Reveal from "./Reveal";

export default function Purpose() {
  return (
    <section className="section section--tight" aria-labelledby="purpose-title">
      <div className="container">
        <p className="label">Built with purpose</p>

        <Reveal>
          <h2 className="purpose-headline" id="purpose-title">
            We make decisions for a reason, not for decoration.
          </h2>
        </Reveal>

        <div className="purpose-grid">
          {purpose.map((item, index) => (
            <Reveal className="purpose-item" key={item.title} delay={index * 100}>
              <div className="purpose-dot" aria-hidden="true" />
              <h3 className="purpose-title">{item.title}</h3>
              <p className="body-md">{item.description}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
