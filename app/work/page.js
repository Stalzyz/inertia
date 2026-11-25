import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import FinalCTA from "@/components/FinalCTA";
import { getFeaturedProjects, getPortfolio } from "@/lib/portfolio";

export const metadata = {
  title: "Selected Work",
  description:
    "Browse live websites across e-commerce, education, software and services, with case notes on each project.",
  alternates: { canonical: "/work" },
};

export default async function WorkPage() {
  const [portfolio, featuredProjects] = await Promise.all([
    getPortfolio(),
    getFeaturedProjects(),
  ]);

  return (
    <>
      <Header />
      <main id="main">
        <section className="page-hero" aria-labelledby="portfolio-title">
          <div className="container">
            <Reveal>
              <p className="label">Portfolio</p>
              <h1 className="page-title" id="portfolio-title">
                Every site has a job to do.
              </h1>
            </Reveal>
            <Reveal delay={100}>
              <div className="page-hero-copy">
                <p className="body-lg">
                  {portfolio.length} live projects, from handloom storefronts
                  and schools to product platforms and service businesses. Open
                  any one for a closer look at its structure and interface.
                </p>
                <div className="page-hero-stats" aria-label="Portfolio summary">
                  <span>{portfolio.length} live sites</span>
                  <span>{featuredProjects.length} featured projects</span>
                  <span>Unique builds, no templates</span>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="section portfolio-section" aria-label="All projects">
          <div className="container">
            <div className="work-grid portfolio-grid">
              {portfolio.map((project, index) => (
                <Reveal
                  as="article"
                  className="project"
                  key={project.slug}
                  delay={(index % 2) * 90}
                >
                  <Link
                    className="project-card"
                    href={`/work/${project.slug}`}
                  >
                    <div className="project-media">
                      <div
                        className="project-media-inner"
                        style={{ "--delay": `${(index % 2) * 90}ms` }}
                      >
                        <Image
                          src={project.image}
                          alt={project.imageAlt}
                          fill
                          sizes="(max-width: 700px) 100vw, 50vw"
                          priority={index < 2}
                        />
                      </div>
                      <span className="project-concept-tag" aria-hidden="true">
                        {project.category}
                      </span>
                    </div>

                    <div className="project-meta">
                      <span className="project-index">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <p className="project-industry">{project.domain}</p>
                        <h2 className="project-name">{project.name}</h2>
                        <p className="project-description">{project.summary}</p>
                        <div className="project-badges">
                          <span className="project-tags">
                            {project.services.join(" / ")}
                          </span>
                        </div>
                      </div>
                      <span className="project-arrow" aria-hidden="true">
                        <ArrowUpRight size={19} strokeWidth={1.6} />
                      </span>
                    </div>
                  </Link>
                  <a
                    className="project-live-link"
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Live site: ${project.name}`}
                  >
                    Live site
                    <ArrowUpRight size={13} strokeWidth={1.8} aria-hidden="true" />
                  </a>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
