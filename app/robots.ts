import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Private screens stay crawlable so engines can read their noindex (sent by middleware); only the API is blocked.
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }], sitemap: `${SITE_URL}/sitemap.xml`, host: SITE_URL };
}
