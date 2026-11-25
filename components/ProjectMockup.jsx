/**
 * Original, art-directed concept UIs. These are deliberately framed as design
 * explorations (dummy brands, no client claims) — not screenshots of real work.
 * Everything is CSS/typography so it stays sharp and lightweight at any size.
 */
function Variant({ variant }) {
  switch (variant) {
    case "editorial":
      return (
        <>
          <div className="mock-nav">
            <span className="mock-nav-brand">FORM / FIELD</span>
            <span className="mock-nav-links">INDEX&nbsp;&nbsp; ABOUT&nbsp;&nbsp; CONTACT</span>
          </div>
          <div className="mock-editorial-body">
            <div className="mock-editorial-head">
              <span className="mock-eyebrow">Independent design practice — Est. 2019</span>
              <h4 className="mock-editorial-title">
                Objects
                <br />
                &amp; intent.
              </h4>
              <p className="mock-editorial-copy">
                A considered studio making quiet things for loud voices. Selected
                work, 2019—2025.
              </p>
              <span className="mock-cta-dark">View the work ↗</span>
            </div>
            <div className="mock-editorial-visual">
              <span className="mock-still-life mock-still-life--one" />
              <span className="mock-still-life mock-still-life--two" />
              <span className="mock-visual-caption">01 — Still life, study</span>
            </div>
          </div>
        </>
      );
    case "commerce":
      return (
        <>
          <div className="mock-nav">
            <span className="mock-nav-brand">OBJECTS &amp; CO.</span>
            <span className="mock-nav-links">SHOP&nbsp;&nbsp; STORY&nbsp;&nbsp; BAG (2)</span>
          </div>
          <div className="mock-commerce-hero">
            <div className="mock-commerce-hero-copy">
              <span className="mock-eyebrow">Everyday objects, considered</span>
              <h4 className="mock-commerce-title">Made to be kept.</h4>
              <span className="mock-cta-light">Shop the collection ↗</span>
            </div>
            <span className="mock-vase" />
          </div>
          <div className="mock-commerce-grid">
            {[
              ["Ceramic No. 01", "₹2,400"],
              ["Linen Throw", "₹4,800"],
              ["Oak Vessel", "₹3,200"],
            ].map(([name, price]) => (
              <div className="mock-product" key={name}>
                <div className="mock-product-image">
                  <span />
                </div>
                <span className="mock-product-name">{name}</span>
                <span className="mock-product-price">{price}</span>
              </div>
            ))}
          </div>
        </>
      );
    case "portfolio":
      return (
        <>
          <div className="mock-nav mock-nav--dark">
            <span className="mock-nav-brand">ATELIER N.</span>
            <span className="mock-nav-links">WORK&nbsp;&nbsp; STUDIO&nbsp;&nbsp; CONTACT</span>
          </div>
          <div className="mock-portfolio-hero">
            <h4 className="mock-portfolio-title">
              Space,
              <br />
              shaped.
            </h4>
            <span className="mock-portfolio-accent" />
          </div>
          <div className="mock-portfolio-grid">
            <div className="mock-portfolio-tile mock-portfolio-tile--tall">
              <span />
            </div>
            <div className="mock-portfolio-tile">
              <span />
            </div>
            <div className="mock-portfolio-tile mock-portfolio-tile--wide">
              <span />
            </div>
          </div>
        </>
      );
    case "hospitality":
      return (
        <>
          <div className="mock-nav">
            <span className="mock-nav-brand mock-brand-serif">CASA SOL</span>
            <span className="mock-nav-links">STAY&nbsp;&nbsp; DINING&nbsp;&nbsp; BOOK</span>
          </div>
          <div className="mock-hospitality-body">
            <div className="mock-hospitality-visual">
              <span className="mock-sun" />
              <span className="mock-arch" />
              <span className="mock-hospitality-caption">Goa, India</span>
            </div>
            <div className="mock-hospitality-copy">
              <span className="mock-eyebrow">A small place by the sea</span>
              <h4 className="mock-hospitality-title">
                Slow days,
                <br />
                warm light.
              </h4>
              <p className="mock-editorial-copy">
                Six rooms, one courtyard, and nothing to rush. Come as you are.
              </p>
              <span className="mock-cta-dark">Reserve a stay ↗</span>
            </div>
          </div>
        </>
      );
    case "saas":
      return (
        <>
          <div className="mock-saas-side">
            <span className="mock-saas-logo">TALLY<span className="mock-logo-dot">.</span></span>
            <span className="mock-saas-nav mock-saas-nav--active">Overview</span>
            <span className="mock-saas-nav">Analytics</span>
            <span className="mock-saas-nav">Customers</span>
            <span className="mock-saas-nav">Settings</span>
            <span className="mock-saas-avatar" />
          </div>
          <div className="mock-saas-main">
            <div className="mock-saas-head">
              <div>
                <span className="mock-eyebrow">Good morning, Alex</span>
                <h4 className="mock-saas-title">Your business at a glance.</h4>
              </div>
              <span className="mock-saas-pill">This month</span>
            </div>
            <div className="mock-saas-cards">
              {[["Revenue", "₹4.2L", "+12%"], ["Active users", "8,412", "+6%"], ["Conversion", "3.8%", "+1.2%"]].map(
                ([label, value, delta]) => (
                  <div className="mock-saas-card" key={label}>
                    <span className="mock-saas-card-label">{label}</span>
                    <strong className="mock-saas-card-value">{value}</strong>
                    <span className="mock-saas-card-delta">{delta}</span>
                  </div>
                )
              )}
            </div>
            <div className="mock-saas-chart">
              {[42, 55, 34, 72, 48, 88, 66].map((height, index) => (
                <span
                  className={`mock-saas-bar${index === 5 ? " mock-saas-bar--accent" : ""}`}
                  key={index}
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>
        </>
      );
    default:
      return null;
  }
}

const urls = {
  editorial: "formandfield.studio",
  commerce: "objectsandco.shop",
  portfolio: "ateliern.design",
  hospitality: "casasol.stay",
  saas: "app.tally.io",
};

export default function ProjectMockup({ variant }) {
  return (
    <div className={`mock-browser mock--${variant}`} aria-hidden="true">
      <div className="mock-bar">
        <span className="mock-dot" />
        <span className="mock-dot" />
        <span className="mock-dot" />
        <span className="mock-url">{urls[variant] || "inertia.creations"}</span>
      </div>
      <div className="mock-page">
        <Variant variant={variant} />
      </div>
    </div>
  );
}
