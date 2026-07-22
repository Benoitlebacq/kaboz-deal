import type { MetadataRoute } from "next";
import { getAllActiveProducts } from "@/lib/queries";
import { sectionToPath } from "@/lib/constants";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getAllActiveProducts();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/tech`, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/jeux-video`, changeFrequency: "daily", priority: 0.8 },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${baseUrl}/${sectionToPath(p.section)}/${p.slug}`,
    lastModified: p.dateMaj ?? undefined,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes];
}
