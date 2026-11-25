"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { normalizeProject, normalizeTestimonial } from "@/lib/admin-validation";
import {
  readPortfolioData,
  readTestimonialsData,
  saveProjectImage,
  saveTestimonialImage,
  writePortfolioData,
  writeTestimonialsData,
} from "@/lib/store";

async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("Unauthorised");
}

function refreshPortfolio() {
  updateTag("portfolio");
  revalidatePath("/");
  revalidatePath("/work");
  revalidatePath("/work/[slug]", "page");
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/portfolio");
}

function refreshTestimonials() {
  updateTag("testimonials");
  revalidatePath("/");
  revalidatePath("/admin/testimonials");
}

export async function saveProject(_previousState, formData) {
  await requireAdmin();

  const currentSlug = String(formData.get("currentSlug") ?? "");
  const projects = await readPortfolioData();
  const existing = currentSlug
    ? projects.find((item) => item.slug === currentSlug)
    : null;

  const { project, error } = normalizeProject(formData, existing);
  if (error) return { error };

  if (
    projects.some(
      (item) => item.slug === project.slug && item.slug !== currentSlug
    )
  ) {
    return { error: "That slug is already used by another project." };
  }

  try {
    const uploaded = await saveProjectImage(formData.get("image"), project.slug);
    if (uploaded) project.image = uploaded;

    const next = existing
      ? projects.map((item) => (item.slug === currentSlug ? project : item))
      : [project, ...projects];
    await writePortfolioData(next);
  } catch (cause) {
    return { error: cause?.message || "Could not save the project." };
  }

  refreshPortfolio();
  redirect(`/admin/portfolio?saved=${encodeURIComponent(project.slug)}`);
}

export async function deleteProject(formData) {
  await requireAdmin();
  const slug = String(formData.get("slug") ?? "");
  const projects = await readPortfolioData();
  await writePortfolioData(projects.filter((item) => item.slug !== slug));
  refreshPortfolio();
  redirect("/admin/portfolio?deleted=1");
}

export async function saveTestimonial(_previousState, formData) {
  await requireAdmin();

  const currentId = String(formData.get("currentId") ?? "");
  const items = await readTestimonialsData();
  const existing = currentId ? items.find((item) => item.id === currentId) : null;

  const { testimonial, error } = normalizeTestimonial(formData, existing);
  if (error) return { error };

  try {
    const uploaded = await saveTestimonialImage(
      formData.get("image"),
      testimonial.name
    );
    if (uploaded) testimonial.image = uploaded;

    const next = existing
      ? items.map((item) => (item.id === currentId ? testimonial : item))
      : [...items, testimonial];
    await writeTestimonialsData(next);
  } catch (cause) {
    return { error: cause?.message || "Could not save the testimonial." };
  }

  refreshTestimonials();
  redirect("/admin/testimonials?saved=1");
}

export async function deleteTestimonial(formData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const items = await readTestimonialsData();
  await writeTestimonialsData(items.filter((item) => item.id !== id));
  refreshTestimonials();
  redirect("/admin/testimonials?deleted=1");
}
