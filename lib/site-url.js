/**
 * Canonical site URL used for metadata, Open Graph, robots and sitemap.
 * Set NEXT_PUBLIC_SITE_URL in your deployment environment to your real domain.
 */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://web.inertiacreation.in";
