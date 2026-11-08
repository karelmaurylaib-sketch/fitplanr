import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const url = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return { rules: [{ userAgent: "*", allow: ["/", "/signup", "/login", "/terms", "/privacy"], disallow: ["/api/", "/dashboard", "/workout", "/history", "/settings", "/account", "/plan", "/start"] }], sitemap: `${url}/sitemap.xml` };
}
