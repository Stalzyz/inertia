import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getPortfolio } from "@/lib/portfolio";
import { getAllTestimonials } from "@/lib/testimonials";

export default async function AdminOverviewPage() {
  const projects = await getPortfolio();
  const testimonials = await getAllTestimonials();
  const published = testimonials.filter((item) => item.published).length;

  return (
    <>
      <div className="admin-heading">
        <p className="label">Dashboard</p>
        <h1 className="admin-title">Manage the studio site.</h1>
        <p className="admin-lede">
          Add live projects with their case-study details, and publish only the
          testimonials you have verified with clients.
        </p>
      </div>

      <div className="admin-stat-grid">
        <div className="admin-stat">
          <span>Portfolio projects</span>
          <strong>{projects.length}</strong>
          <Link href="/admin/portfolio">
            Manage <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        </div>
        <div className="admin-stat">
          <span>Testimonials</span>
          <strong>{testimonials.length}</strong>
          <Link href="/admin/testimonials">
            Manage <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        </div>
        <div className="admin-stat">
          <span>Published quotes</span>
          <strong>{published}</strong>
          <Link href="/admin/testimonials/new">
            Add one <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="admin-panel">
        <h2>Quick actions</h2>
        <div className="admin-quick-links">
          <Link href="/admin/portfolio/new">Add a portfolio project ↗</Link>
          <Link href="/admin/testimonials/new">Add a testimonial ↗</Link>
          <Link href="/work" target="_blank" rel="noopener noreferrer">
            View public portfolio ↗
          </Link>
        </div>
      </div>
    </>
  );
}
