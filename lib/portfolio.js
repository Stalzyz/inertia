import { cacheLife, cacheTag } from "next/cache";
import { readPortfolioData } from "@/lib/store";

/**
 * Portfolio content is managed in /admin and persisted to data/portfolio.json.
 * The cached reader is tagged so a save can invalidate it immediately.
 *
 * Case-study copy should describe what is observable on the published site:
 * structure, sections and interface details — never unverified performance
 * numbers, client results or invented testimonials.
 */
export async function getPortfolio() {
  "use cache";
  cacheTag("portfolio");
  cacheLife("hours");
  return readPortfolioData();
}

export async function getFeaturedProjects() {
  const projects = await getPortfolio();
  return projects.filter((project) => project.featured);
}

export async function getProject(slug) {
  const projects = await getPortfolio();
  return projects.find((project) => project.slug === slug) ?? null;
}
