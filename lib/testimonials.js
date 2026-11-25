import { cacheLife, cacheTag } from "next/cache";
import { readTestimonialsData } from "@/lib/store";

/**
 * Only testimonials marked published in /admin reach the public site.
 * The section stays hidden while the published list is empty.
 */
export async function getTestimonials() {
  "use cache";
  cacheTag("testimonials");
  cacheLife("hours");
  const items = await readTestimonialsData();
  return items.filter((item) => item.published);
}

export async function getAllTestimonials() {
  "use cache";
  cacheTag("testimonials");
  cacheLife("hours");
  return readTestimonialsData();
}
