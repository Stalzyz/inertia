import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getFeaturedProjects, getPortfolio } from "@/lib/portfolio";
import Reveal from "./Reveal";

export default async function Work() {
  const [featuredProjects, projects] = await Promise.all([
    getFeaturedProjects(),
    getPortfolio(),
  ]);

  return (
    <section className="section" id="work" aria-labelledby="work-title">
      <div className="container">
        <div className="section-head">
          <Reveal>
            <p className="label">Selected work</p>
            <h2 className="section-title" id="work-title">
              Live sites, built to work.
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="body-lg">
              A selection from our portfolio across commerce, education and
              software. Each project has its own structure, pace and purpose —
              and a case study that shows how it comes together.
            </p>
          </Reveal>
        </div>

        <div className="work-grid">
          {featuredProjects.map((project, index) => (
            <Reveal
              as="article"
              className="project"
              key={project.slug}
              delay={index * 90}
            >
              <Link
                className="project-card"
                href={`/work/${project.slug}`}
              >
                <div className="project-media">
                  <div
                    className="project-media-inner"
                    style={{ "--delay": `${index * 90}ms` }}
                  >
                    <Image
                      src={project.image}
                      alt={project.imageAlt}
                      fill
                      sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 60vw"
                    />
                  </div>
                  <span className="project-concept-tag" aria-hidden="true">
                    Case study
                  </span>
                </div>

                <div className="project-meta">
                  <span className="project-index">0{index + 1}</span>
                  <div>
                    <p className="project-industry">{project.industry}</p>
                    <h3 className="project-name">{project.name}</h3>
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

        <Reveal className="work-all">
          <Link className="text-link" href="/work">
            See all {projects.length} projects
            <ArrowUpRight size={15} strokeWidth={1.8} aria-hidden="true" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
