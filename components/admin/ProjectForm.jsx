"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

function SubmitButton({ edit }) {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn--accent" type="submit" disabled={pending}>
      {pending ? "Saving…" : edit ? "Save changes" : "Add project"}
    </button>
  );
}

const emptyProject = {
  slug: "",
  name: "",
  domain: "",
  url: "",
  category: "",
  industry: "",
  services: [],
  summary: "",
  image: "",
  imageAlt: "",
  overview: "",
  sections: [],
  approach: [],
  notes: [],
  featured: false,
};

function approachValue(project, index, key) {
  return project?.approach?.[index]?.[key] ?? "";
}

export default function ProjectForm({ action, project }) {
  const [state, formAction] = useActionState(action, { error: "" });
  const initial = project ?? emptyProject;
  const [values, setValues] = useState({
    name: initial.name,
    slug: initial.slug,
    url: initial.url,
    domain: initial.domain,
    category: initial.category,
    industry: initial.industry,
    services: initial.services.join(", "),
    summary: initial.summary,
    imageAlt: initial.imageAlt,
    overview: initial.overview,
    sections: initial.sections.join("\n"),
    notes: initial.notes.join("\n"),
    approachTitle1: approachValue(initial, 0, "title"),
    approachBody1: approachValue(initial, 0, "body"),
    approachTitle2: approachValue(initial, 1, "title"),
    approachBody2: approachValue(initial, 1, "body"),
    approachTitle3: approachValue(initial, 2, "title"),
    approachBody3: approachValue(initial, 2, "body"),
    featured: Boolean(initial.featured),
  });

  const set = (key) => (event) => {
    const value =
      event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setValues((current) => ({ ...current, [key]: value }));
  };

  return (
    <form className="admin-form" action={formAction}>
      {project ? (
        <input type="hidden" name="currentSlug" value={project.slug} />
      ) : null}
      <input type="hidden" name="currentImage" value={initial.image} />

      <div className="admin-form-section">
        <h2>Project basics</h2>
        <div className="admin-grid">
          <div className="admin-field">
            <label htmlFor="name">Project name *</label>
            <input id="name" name="name" required value={values.name} onChange={set("name")} />
          </div>
          <div className="admin-field">
            <label htmlFor="slug">URL slug</label>
            <input
              id="slug"
              name="slug"
              value={values.slug}
              onChange={set("slug")}
              placeholder="generated-from-name"
            />
          </div>
          <div className="admin-field admin-field--wide">
            <label htmlFor="url">Live site URL *</label>
            <input
              id="url"
              name="url"
              type="url"
              required
              value={values.url}
              onChange={set("url")}
              placeholder="https://example.com"
            />
          </div>
          <div className="admin-field">
            <label htmlFor="domain">Display domain</label>
            <input
              id="domain"
              name="domain"
              value={values.domain}
              onChange={set("domain")}
              placeholder="derived from the URL if blank"
            />
          </div>
          <div className="admin-field">
            <label htmlFor="category">Category *</label>
            <input id="category" name="category" required value={values.category} onChange={set("category")} />
          </div>
          <div className="admin-field">
            <label htmlFor="industry">Industry</label>
            <input id="industry" name="industry" value={values.industry} onChange={set("industry")} />
          </div>
          <div className="admin-field admin-field--wide">
            <label htmlFor="services">Services shown</label>
            <input
              id="services"
              name="services"
              value={values.services}
              onChange={set("services")}
              placeholder="E-commerce, Art direction, Development"
            />
          </div>
          <div className="admin-field admin-field--wide">
            <label htmlFor="summary">Short summary *</label>
            <input id="summary" name="summary" required value={values.summary} onChange={set("summary")} />
          </div>
        </div>
      </div>

      <div className="admin-form-section">
        <h2>Case study</h2>
        <div className="admin-field">
          <label htmlFor="overview">Overview *</label>
          <textarea id="overview" name="overview" rows={5} required value={values.overview} onChange={set("overview")} />
        </div>
        <div className="admin-field">
          <label htmlFor="sections">Page sections</label>
          <textarea
            id="sections"
            name="sections"
            rows={6}
            value={values.sections}
            onChange={set("sections")}
            placeholder={"One section per line\nShop by Collection\nNew Arrivals"}
          />
        </div>
        <div className="admin-approach">
          {[1, 2, 3].map((index) => (
            <div className="admin-approach-item" key={index}>
              <p className="label">Approach 0{index}</p>
              <div className="admin-field">
                <label htmlFor={`approachTitle${index}`}>Title</label>
                <input
                  id={`approachTitle${index}`}
                  name={`approachTitle${index}`}
                  value={values[`approachTitle${index}`]}
                  onChange={set(`approachTitle${index}`)}
                />
              </div>
              <div className="admin-field">
                <label htmlFor={`approachBody${index}`}>Description</label>
                <textarea
                  id={`approachBody${index}`}
                  name={`approachBody${index}`}
                  rows={3}
                  value={values[`approachBody${index}`]}
                  onChange={set(`approachBody${index}`)}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="admin-field">
          <label htmlFor="notes">Interface notes</label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            value={values.notes}
            onChange={set("notes")}
            placeholder="One observable detail per line"
          />
        </div>
      </div>

      <div className="admin-form-section">
        <h2>Screenshot</h2>
        <div className="admin-grid">
          <div className="admin-field admin-field--wide">
            <label htmlFor="image">Upload screenshot</label>
            <input id="image" name="image" type="file" accept="image/png,image/jpeg,image/webp,image/avif" />
            <p className="admin-hint">PNG, JPEG, WebP or AVIF up to 8 MB. Leave blank to keep the current image.</p>
          </div>
          <div className="admin-field admin-field--wide">
            <label htmlFor="imageAlt">Image description</label>
            <input id="imageAlt" name="imageAlt" value={values.imageAlt} onChange={set("imageAlt")} />
          </div>
        </div>
        <label className="admin-check">
          <input
            type="checkbox"
            name="featured"
            checked={values.featured}
            onChange={set("featured")}
          />
          <span>Feature on the homepage</span>
        </label>
      </div>

      {state?.error ? (
        <p className="admin-msg admin-msg--error" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="admin-form-actions">
        <SubmitButton edit={Boolean(project)} />
        <Link className="admin-cancel" href="/admin/portfolio">
          Cancel
        </Link>
      </div>
    </form>
  );
}
