import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { INFO_PAGES } from "@/content/pages";
import { listSitemapProducts } from "@/lib/catalog";
import { CATEGORIES } from "@/lib/types";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await listSitemapProducts();
  const now = new Date();

  return [
    { url: site.url, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/collections`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    ...CATEGORIES.map((c) => ({
      url: `${site.url}/collections/${c.value}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...products.map((p) => ({
      url: `${site.url}/produits/${p.slug}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...Object.entries(INFO_PAGES)
      .filter(([, page]) => !page.noindex)
      .map(([slug]) => ({
        url: `${site.url}/${slug}`,
        changeFrequency: "monthly" as const,
        priority: 0.4,
      })),
  ];
}
