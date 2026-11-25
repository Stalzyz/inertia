import Image from "next/image";
import { getTestimonials } from "@/lib/testimonials";

function initial(name) {
  return name.replace(/^SAMPLE\s*—\s*/i, "").trim().charAt(0).toUpperCase() || "?";
}

/**
 * Only renders when verified testimonials have been published in /admin.
 * We deliberately don't fabricate client quotes or names.
 */
export default async function Testimonials() {
  const testimonials = await getTestimonials();
  if (!testimonials.length) return null;

  return (
    <section
      className="section section--tight testimonials-section"
      aria-labelledby="testimonials-title"
    >
      <div className="container testimonials-head">
        <p className="label" id="testimonials-title">
          Kind words
        </p>
        <p className="testimonials-hint" aria-hidden="true">
          Scroll to read more <span>→</span>
        </p>
      </div>

      <div
        className="testimonials-scroller"
        role="region"
        aria-label="Client testimonials"
        tabIndex={0}
      >
        <div className="testimonials-track">
          {testimonials.map((testimonial, index) => (
            <figure
              className="testimonial-card"
              key={`${testimonial.name}-${index}`}
            >
              <blockquote className="testimonial-quote">
                “{testimonial.quote}”
              </blockquote>
              <figcaption className="testimonial-meta">
                <span
                  className={`testimonial-avatar${testimonial.image ? "" : " testimonial-avatar--fallback"}`}
                  aria-hidden="true"
                >
                  {testimonial.image ? (
                    <Image
                      src={testimonial.image}
                      alt=""
                      width={64}
                      height={64}
                      sizes="64px"
                      loading="eager"
                    />
                  ) : (
                    initial(testimonial.name)
                  )}
                </span>
                <span className="testimonial-meta-text">
                  <strong>{testimonial.name}</strong>
                  {testimonial.company ? <span>{testimonial.company}</span> : null}
                  {testimonial.projectType ? (
                    <span>{testimonial.projectType}</span>
                  ) : null}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
