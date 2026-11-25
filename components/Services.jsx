import { ArrowUpRight } from "lucide-react";
import { services } from "@/lib/content";
import Reveal from "./Reveal";

const previewStyles = {
  editorial: {
    background: "#f4f1ea",
    padding: 14,
    display: "grid",
    gridTemplateColumns: "1fr 0.8fr",
    gap: 10,
  },
  code: {
    background: "#171717",
    padding: 14,
    display: "flex",
    flexDirection: "column",
    gap: 7,
  },
  commerce: {
    background: "#fbfaf7",
    padding: 12,
    display: "grid",
    gridTemplateRows: "auto 1fr",
    gap: 8,
  },
  landing: {
    background: "#eeede7",
    padding: 14,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 7,
  },
  split: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    background: "#fff",
  },
  system: {
    background: "#f3f4f6",
    display: "flex",
    padding: 0,
  },
};

function ServicePreview({ variant }) {
  switch (variant) {
    case "editorial":
      return (
        <div style={previewStyles.editorial}>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <span style={{ height: 4, width: "45%", background: "#1b1a18", opacity: 0.3 }} />
            <span style={{ height: 20, width: "90%", background: "#1b1a18", opacity: 0.8 }} />
            <span style={{ height: 20, width: "65%", background: "#1b1a18", opacity: 0.8 }} />
            <span style={{ height: 4, width: "70%", background: "#1b1a18", opacity: 0.22 }} />
          </div>
          <div style={{ background: "#cbc5b7", height: "100%" }} />
        </div>
      );
    case "code":
      return (
        <div style={previewStyles.code}>
          <span style={{ height: 4, width: "55%", background: "#ffdb09", opacity: 0.9 }} />
          <span style={{ height: 4, width: "85%", background: "#f5f4f0", opacity: 0.35 }} />
          <span style={{ height: 4, width: "70%", background: "#f5f4f0", opacity: 0.35 }} />
          <span style={{ height: 4, width: "78%", background: "#ffdb09", opacity: 0.55 }} />
          <span style={{ height: 4, width: "48%", background: "#f5f4f0", opacity: 0.35 }} />
        </div>
      );
    case "commerce":
      return (
        <div style={previewStyles.commerce}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ height: 6, width: "35%", background: "#1b1a18", opacity: 0.75 }} />
            <span style={{ height: 6, width: "12%", background: "#1b1a18", opacity: 0.4 }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
            <span style={{ background: "#ded9cd", height: "100%" }} />
            <span style={{ background: "#b9b1a1", height: "100%" }} />
            <span style={{ background: "#d3c9b7", height: "100%" }} />
          </div>
        </div>
      );
    case "landing":
      return (
        <div style={previewStyles.landing}>
          <span style={{ height: 4, width: "30%", background: "#1b1a18", opacity: 0.25 }} />
          <span style={{ height: 16, width: "72%", background: "#1b1a18", opacity: 0.8 }} />
          <span style={{ height: 5, width: "52%", background: "#1b1a18", opacity: 0.25 }} />
          <span style={{ height: 12, width: "40%", background: "#8a6200", marginTop: 4 }} />
        </div>
      );
    case "split":
      return (
        <div style={previewStyles.split}>
          <div style={{ background: "#e5e1d7", padding: 12, display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ height: 5, width: "70%", background: "#1b1a18", opacity: 0.3 }} />
            <span style={{ height: 5, width: "50%", background: "#1b1a18", opacity: 0.2 }} />
          </div>
          <div style={{ background: "#1b1a18", padding: 12, display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ height: 5, width: "70%", background: "#f5f4f0", opacity: 0.5 }} />
            <span style={{ height: 5, width: "40%", background: "#ffdb09", opacity: 0.9 }} />
          </div>
        </div>
      );
    default:
      return (
        <div style={previewStyles.system}>
          <div style={{ width: "30%", background: "#1b1a18", padding: 10, display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ height: 4, width: "80%", background: "#ffdb09" }} />
            <span style={{ height: 4, width: "60%", background: "#f5f4f0", opacity: 0.3 }} />
            <span style={{ height: 4, width: "70%", background: "#f5f4f0", opacity: 0.3 }} />
          </div>
          <div style={{ flex: 1, padding: 10, display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ height: 4, width: "70%", background: "#1b1a18", opacity: 0.3 }} />
            <span style={{ height: 16, background: "#e2e0d8" }} />
            <span style={{ height: 16, background: "#8a6200", opacity: 0.65 }} />
          </div>
        </div>
      );
  }
}

export default function Services() {
  return (
    <section className="section" id="services" aria-labelledby="services-title">
      <div className="container">
        <div className="section-head">
          <Reveal>
            <p className="label">What we do</p>
            <h2 className="section-title" id="services-title">
              Everything you need to make your business stand out online.
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="body-lg">
              From the first visual direction to the final line of code, we
              handle the whole picture — or exactly the part you need.
            </p>
          </Reveal>
        </div>

        <div className="service-list">
          {services.map((service, index) => (
            <Reveal
              as="article"
              className="service-row"
              key={service.number}
              delay={index * 70}
            >
              <span className="service-number">{service.number}</span>
              <h3 className="service-title">{service.title}</h3>
              <p className="service-desc">{service.description}</p>
              <span className="service-arrow" aria-hidden="true">
                <ArrowUpRight size={22} strokeWidth={1.5} />
              </span>
              <div className="service-preview" aria-hidden="true">
                <div style={{ height: "100%" }}>
                  <ServicePreview variant={service.preview} />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
