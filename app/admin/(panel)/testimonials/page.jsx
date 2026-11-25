import Link from "next/link";
import { getAllTestimonials } from "@/lib/testimonials";
import { deleteTestimonial } from "../actions";
import DeleteForm from "@/components/admin/DeleteForm";

export const metadata = { title: "Testimonials — Studio admin" };

export default async function AdminTestimonialsPage({ searchParams }) {
  const params = await searchParams;
  const items = await getAllTestimonials();

  return (
    <>
      <div className="admin-heading admin-heading--row">
        <div>
          <p className="label">Testimonials</p>
          <h1 className="admin-title">Client words.</h1>
          <p className="admin-lede">
            Add quotes you have verified. Only published ones appear on the
            site; the section stays hidden while none are published.
          </p>
        </div>
        <Link className="btn btn--accent" href="/admin/testimonials/new">
          Add testimonial
        </Link>
      </div>

      {params?.saved ? (
        <p className="admin-msg admin-msg--ok" role="status">
          Testimonial saved.
        </p>
      ) : null}
      {params?.deleted ? (
        <p className="admin-msg admin-msg--ok" role="status">
          Testimonial removed.
        </p>
      ) : null}

      <div className="admin-panel admin-list">
        {items.length === 0 ? (
          <p className="admin-empty">No testimonials yet. Add the first one.</p>
        ) : (
          <ul className="admin-rows">
            {items.map((item) => (
              <li className="admin-row" key={item.id}>
                <div className="admin-row-main">
                  <strong>{item.name}</strong>
                  <span className="admin-quote-snippet">“{item.quote}”</span>
                </div>
                <div className="admin-row-meta">
                  {item.published ? (
                    <span className="admin-tag">Published</span>
                  ) : (
                    <span className="admin-tag admin-tag--muted">Draft</span>
                  )}
                  {item.company ? <span>{item.company}</span> : null}
                </div>
                <div className="admin-row-actions">
                  <Link href={`/admin/testimonials/${item.id}`}>Edit</Link>
                  <DeleteForm
                    action={deleteTestimonial}
                    idField="id"
                    id={item.id}
                    name={`the testimonial from ${item.name}`}
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
