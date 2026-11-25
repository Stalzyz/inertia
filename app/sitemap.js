import { siteUrl } from "@/lib/site-url";
import { getPortfolio } from "@/lib/portfolio";

export default async function sitemap() {
  const portfolio = await getPortfolio();
  const lastModified = new Date();

  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${siteUrl}/work`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    ...portfolio.map((project) => ({
      url: `${siteUrl}/work/${project.slug}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    })),
  ];
}
