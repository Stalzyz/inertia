import { randomUUID } from "node:crypto";

function field(formData, key, fallback = "") {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : fallback;
}

export function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function lines(value) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function commaList(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function domainFromUrl(url) {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname === "/" ? "" : parsed.pathname.replace(/^\//, "");
    return `${parsed.host}${path ? `/${path}` : ""}`;
  } catch {
    return "";
  }
}

export function normalizeProject(formData, existing = null) {
  const name = field(formData, "name");
  const slug = slugify(field(formData, "slug") || name || existing?.slug || "");
  const url = field(formData, "url");
  const category = field(formData, "category");
  const summary = field(formData, "summary");
  const overview = field(formData, "overview");

  if (!name) return { error: "Project name is required." };
  if (slug.length < 2) return { error: "A valid slug is required." };
  if (!/^https?:\/\/[^\s]+$/i.test(url)) {
    return { error: "Enter the live site URL starting with https://." };
  }
  if (!category) return { error: "Category is required." };
  if (!summary) return { error: "Short summary is required." };
  if (!overview) return { error: "Overview is required." };

  const approach = [1, 2, 3]
    .map((index) => ({
      title: field(formData, `approachTitle${index}`),
      body: field(formData, `approachBody${index}`),
    }))
    .filter((item) => item.title || item.body)
    .map((item) => ({ title: item.title || "Detail", body: item.body }));

  return {
    project: {
      slug,
      name,
      domain: field(formData, "domain") || domainFromUrl(url),
      url,
      category,
      featured: formData.get("featured") === "on",
      image: field(formData, "currentImage", existing?.image ?? ""),
      imageAlt: field(formData, "imageAlt") || `Screenshot of ${name} website`,
      summary,
      industry: field(formData, "industry") || category,
      services: commaList(field(formData, "services")),
      overview,
      sections: lines(field(formData, "sections")),
      approach,
      notes: lines(field(formData, "notes")),
    },
    error: null,
  };
}

export function normalizeTestimonial(formData, existing = null) {
  const quote = field(formData, "quote");
  const name = field(formData, "name");

  if (quote.length < 20) {
    return { error: "Quote must be at least 20 characters." };
  }
  if (quote.length > 1200) {
    return { error: "Quote must be 1200 characters or fewer." };
  }
  if (!name) return { error: "Client name is required." };

  return {
    testimonial: {
      id: existing?.id ?? randomUUID(),
      quote,
      name,
      company: field(formData, "company"),
      projectType: field(formData, "projectType"),
      image: field(formData, "currentImage", existing?.image ?? ""),
      published: formData.get("published") === "on",
    },
    error: null,
  };
}
