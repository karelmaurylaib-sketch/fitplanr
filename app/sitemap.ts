import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return ["", "/signup", "/login", "/terms", "/privacy"].map((p) => ({ url: url + p, changeFrequency: "weekly", priority: p ? 0.5 : 1 }));
}
