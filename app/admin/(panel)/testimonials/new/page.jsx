import TestimonialForm from "@/components/admin/TestimonialForm";
import { saveTestimonial } from "../../actions";

export const metadata = { title: "Add testimonial — Studio admin" };

export default function NewTestimonialPage() {
  return (
    <>
      <div className="admin-heading">
        <p className="label">Testimonials / New</p>
        <h1 className="admin-title">Add a testimonial.</h1>
        <p className="admin-lede">
          Paste the client&apos;s approved words exactly. Keep it unpublished
          until the quote and attribution are confirmed.
        </p>
      </div>
      <div className="admin-panel admin-panel--narrow">
        <TestimonialForm action={saveTestimonial} />
      </div>
    </>
  );
}
