import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export default function robots(): MetadataRoute.Robots {
  const base = site.url.replace(/\/$/, "");
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/shop/checkout", "/checkout/service", "/donation", "/admin", "/api"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
