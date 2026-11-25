import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getPortfolio } from "@/lib/portfolio";
import { deleteProject } from "../actions";
import DeleteForm from "@/components/admin/DeleteForm";

export const metadata = { title: "Portfolio — Studio admin" };

export default async function AdminPortfolioPage({ searchParams }) {
  const params = await searchParams;
  const projects = await getPortfolio();

  return (
    <>
      <div className="admin-heading admin-heading--row">
        <div>
          <p className="label">Portfolio</p>
          <h1 className="admin-title">Live projects.</h1>
          <p className="admin-lede">
            {projects.length} projects. Featured projects appear in the homepage
            work section.
          </p>
        </div>
        <Link className="btn btn--accent" href="/admin/portfolio/new">
          Add project
        </Link>
      </div>

      {params?.saved ? (
        <p className="admin-msg admin-msg--ok" role="status">
          Saved “{params.saved}”.
        </p>
      ) : null}
      {params?.deleted ? (
        <p className="admin-msg admin-msg--ok" role="status">
          Project removed.
        </p>
      ) : null}

      <div className="admin-panel admin-list">
        {projects.length === 0 ? (
          <p className="admin-empty">No projects yet. Add the first one.</p>
        ) : (
          <ul className="admin-rows">
            {projects.map((project) => (
              <li className="admin-row" key={project.slug}>
                <div className="admin-row-main">
                  <strong>{project.name}</strong>
                  <span>
                    {project.category} · /work/{project.slug}
                  </span>
                </div>
                <div className="admin-row-meta">
                  {project.featured ? <span className="admin-tag">Featured</span> : null}
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${project.name} live site`}
                  >
                    Live <ArrowUpRight size={12} aria-hidden="true" />
                  </a>
                </div>
                <div className="admin-row-actions">
                  <Link href={`/admin/portfolio/${project.slug}`}>Edit</Link>
                  <DeleteForm
                    action={deleteProject}
                    idField="slug"
                    id={project.slug}
                    name={project.name}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
