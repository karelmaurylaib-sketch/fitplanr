import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/site";

// Crawl everything public. Private screens are kept out of the index with a noindex meta tag (not a disallow,
// which would stop Google from ever seeing the noindex). Only the API is blocked.
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }], sitemap: `${SITE_URL}/sitemap.xml`, host: SITE_URL };
}
