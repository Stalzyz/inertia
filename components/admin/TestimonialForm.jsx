"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

function SubmitButton({ edit }) {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn--accent" type="submit" disabled={pending}>
      {pending ? "Saving…" : edit ? "Save changes" : "Add testimonial"}
    </button>
  );
}

const empty = {
  id: "",
  quote: "",
  name: "",
  company: "",
  projectType: "",
  published: false,
};

export default function TestimonialForm({ action, testimonial }) {
  const [state, formAction] = useActionState(action, { error: "" });
  const initial = testimonial ?? empty;
  const [values, setValues] = useState({
    quote: initial.quote,
    name: initial.name,
    company: initial.company,
    projectType: initial.projectType,
    published: Boolean(initial.published),
  });

  const set = (key) => (event) => {
    const value =
      event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setValues((current) => ({ ...current, [key]: value }));
  };

  return (
    <form className="admin-form" action={formAction}>
      {testimonial ? (
        <input type="hidden" name="currentId" value={testimonial.id} />
      ) : null}
      <input type="hidden" name="currentImage" value={initial.image ?? ""} />

      <div className="admin-field">
        <label htmlFor="quote">Verified quote *</label>
        <textarea
          id="quote"
          name="quote"
          rows={7}
          required
          minLength={20}
          maxLength={1200}
          value={values.quote}
          onChange={set("quote")}
          placeholder="Paste the client's approved words exactly."
        />
        <p className="admin-hint">{values.quote.length} / 1200 characters</p>
      </div>

      <div className="admin-grid">
        <div className="admin-field">
          <label htmlFor="testimonial-name">Client name *</label>
          <input
            id="testimonial-name"
            name="name"
            required
            value={values.name}
            onChange={set("name")}
          />
        </div>
        <div className="admin-field">
          <label htmlFor="company">Company</label>
          <input
            id="company"
            name="company"
            value={values.company}
            onChange={set("company")}
          />
        </div>
        <div className="admin-field admin-field--wide">
          <label htmlFor="projectType">Project type</label>
          <input
            id="projectType"
            name="projectType"
            value={values.projectType}
            onChange={set("projectType")}
            placeholder="E-commerce website"
          />
        </div>
      </div>

      <div className="admin-form-section">
        <h2>Profile picture</h2>
        <div className="admin-upload-row">
          {initial.image ? (
            <span className="admin-upload-preview">
              <Image
                src={initial.image}
                alt="Current profile picture"
                width={64}
                height={64}
                unoptimized
              />
            </span>
          ) : null}
          <div className="admin-field">
            <label htmlFor="testimonial-image">Upload client photo</label>
            <input
              id="testimonial-image"
              name="image"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/avif"
            />
            <p className="admin-hint">
              PNG, JPEG, WebP or AVIF up to 8 MB. Leave blank to keep the
              current picture. If none is uploaded, the client&apos;s initial is
              shown.
            </p>
          </div>
        </div>
      </div>

      <label className="admin-check">
        <input
          type="checkbox"
          name="published"
          checked={values.published}
          onChange={set("published")}
        />
        <span>Publish on the site</span>
      </label>
      <p className="admin-hint">
        Only published testimonials appear on the homepage. Leave unchecked
        until the quote and attribution are confirmed.
      </p>

      {state?.error ? (
        <p className="admin-msg admin-msg--error" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="admin-form-actions">
        <SubmitButton edit={Boolean(testimonial)} />
        <Link className="admin-cancel" href="/admin/testimonials">
          Cancel
        </Link>
      </div>
    </form>
  );
}
