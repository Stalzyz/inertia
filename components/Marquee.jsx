import { marquee } from "@/lib/content";

function Track({ reverse = false }) {
  const items = marquee.map((term, index) => (
    <span className="marquee-item" key={`${term}-${index}`}>
      {term}
      <span className="marquee-star" aria-hidden="true">
        ✳
      </span>
    </span>
  ));

  return (
    <div className={`marquee-row${reverse ? " marquee-row--reverse" : ""}`}>
      <div className="marquee-track">
        <div className="marquee-group">{items}</div>
        <div className="marquee-group" aria-hidden="true">
          {items}
        </div>
      </div>
    </div>
  );
}

export default function Marquee() {
  return (
    <section className="marquee" aria-label="What we do">
      <Track />
      <Track reverse />
    </section>
  );
}
