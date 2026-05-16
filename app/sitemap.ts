import type { MetadataRoute } from "next";
import { getServiceSlugs, site } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url.replace(/\/$/, "");
  const staticRoutes = ["", "/services", "/reiki", "/contact", "/legal/privacy", "/legal/terms"] as const;

  const entries: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));

  for (const { slug } of getServiceSlugs()) {
    entries.push({
      url: `${base}/services/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return entries;
}
