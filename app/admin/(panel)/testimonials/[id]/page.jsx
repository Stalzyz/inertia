import { notFound } from "next/navigation";
import TestimonialForm from "@/components/admin/TestimonialForm";
import { getAllTestimonials } from "@/lib/testimonials";
import { saveTestimonial } from "../../actions";

export default async function EditTestimonialPage({ params }) {
  const { id } = await params;
  const testimonials = await getAllTestimonials();
  const testimonial = testimonials.find((item) => item.id === id);
  if (!testimonial) notFound();

  return (
    <>
      <div className="admin-heading">
        <p className="label">Testimonials / Edit</p>
        <h1 className="admin-title">{testimonial.name}</h1>
        <p className="admin-lede">
          Changes publish to the homepage as soon as you save.
        </p>
      </div>
      <div className="admin-panel admin-panel--narrow">
        <TestimonialForm action={saveTestimonial} testimonial={testimonial} />
      </div>
    </>
  );
}
