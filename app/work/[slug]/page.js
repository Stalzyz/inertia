import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import FinalCTA from "@/components/FinalCTA";
import { getPortfolio, getProject } from "@/lib/portfolio";

// Every field on this route is selected by the slug, so there is no shared
// instant shell to preserve. Keep the documented blocking behaviour instead of
// surfacing a dev-only "URL data outside of Suspense" warning.
export const instant = false;

export async function generateStaticParams() {
  const projects = await getPortfolio();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: "Case study not found" };

  return {
    title: `${project.name} — Case study`,
    description: project.overview,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      type: "article",
      title: `${project.name} — Case study`,
      description: project.summary,
      url: `/work/${project.slug}`,
      images: [{ url: project.image, width: 1440, height: 900 }],
    },
  };
}

export default async function CaseStudyPage({ params }) {
  const { slug } = await params;
  const [project, portfolio] = await Promise.all([
    getProject(slug),
    getPortfolio(),
  ]);
  if (!project) notFound();

  const index = portfolio.findIndex((item) => item.slug === project.slug);
  const nextProject = portfolio[(index + 1) % portfolio.length];
  const previousProject =
    portfolio[(index - 1 + portfolio.length) % portfolio.length];

  return (
    <>
      <Header />
      <main id="main" className="case-study">
        <section className="page-hero case-hero" aria-labelledby="case-title">
          <div className="container">
            <Reveal>
              <Link className="case-back" href="/work">
                <ArrowLeft size={14} strokeWidth={1.8} aria-hidden="true" />
                All projects
              </Link>
              <p className="label">{project.category} — case study</p>
              <h1 className="page-title" id="case-title">
                {project.name}
              </h1>
              <p className="body-lg case-summary">{project.summary}</p>
              <div className="case-actions">
                <a
                  className="btn btn--dark"
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit live site
                  <ArrowUpRight size={15} strokeWidth={1.8} aria-hidden="true" />
                </a>
                <Link className="text-link" href="/#contact">
                  Start a project like this
                  <ArrowUpRight size={15} strokeWidth={1.8} aria-hidden="true" />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="case-media-section" aria-label={`${project.name} screenshot`}>
          <div className="container">
            <Reveal className="case-media-frame">
              <Image
                src={project.image}
                alt={project.imageAlt}
                width={1440}
                height={900}
                sizes="(max-width: 700px) 100vw, 92vw"
                priority
              />
            </Reveal>
            <p className="case-media-caption">
              {project.domain} — published page captured for this case study.
            </p>
          </div>
        </section>

        <section className="section case-content" aria-label="Case study details">
          <div className="container case-layout">
            <div className="case-main">
              <Reveal>
                <p className="label">Overview</p>
                <h2 className="case-section-title">What the site does</h2>
                <p className="case-prose">{project.overview}</p>
              </Reveal>

              <Reveal className="case-block">
                <p className="label">Structure</p>
                <h2 className="case-section-title">What&apos;s on the page</h2>
                <ol className="case-sections-list">
                  {project.sections.map((section, sectionIndex) => (
                    <li key={section}>
                      <span>{String(sectionIndex + 1).padStart(2, "0")}</span>
                      {section}
                    </li>
                  ))}
                </ol>
              </Reveal>

              <Reveal className="case-block">
                <p className="label">Approach</p>
                <h2 className="case-section-title">How it comes together</h2>
                <div className="case-approach">
                  {project.approach.map((item, itemIndex) => (
                    <article className="case-approach-item" key={item.title}>
                      <span>0{itemIndex + 1}</span>
                      <div>
                        <h3>{item.title}</h3>
                        <p>{item.body}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </Reveal>
            </div>

            <aside className="case-aside" aria-label="Project details">
              <Reveal className="case-aside-inner">
                <p className="label">At a glance</p>
                <dl>
                  <div>
                    <dt>Live site</dt>
                    <dd>{project.domain}</dd>
                  </div>
                  <div>
                    <dt>Category</dt>
                    <dd>{project.category}</dd>
                  </div>
                  <div>
                    <dt>Industry</dt>
                    <dd>{project.industry}</dd>
                  </div>
                  <div>
                    <dt>Work shown</dt>
                    <dd>{project.services.join(", ")}</dd>
                  </div>
                </dl>
                <a
                  className="case-aside-link"
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open {project.domain}
                  <ArrowUpRight size={15} strokeWidth={1.8} aria-hidden="true" />
                </a>
                <p className="case-note">
                  These notes describe the site as published. No performance
                  figures or client-result claims are included.
                </p>
              </Reveal>
            </aside>
          </div>
        </section>

        <section className="case-interface" aria-label="Interface notes">
          <div className="container">
            <Reveal>
              <p className="label">Interface notes</p>
              <div className="case-notes">
                {project.notes.map((note) => (
                  <p key={note}>{note}</p>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <nav className="case-nav" aria-label="Case study navigation">
          <div className="container case-nav-inner">
            <Link href={`/work/${previousProject.slug}`}>
              <span>Previous</span>
              {previousProject.name}
            </Link>
            <Link href="/work">All projects</Link>
            <Link href={`/work/${nextProject.slug}`}>
              <span>Next</span>
              {nextProject.name}
            </Link>
          </div>
        </nav>

        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
