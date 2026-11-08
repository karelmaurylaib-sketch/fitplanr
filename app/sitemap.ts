import type { MetadataRoute } from "next";
import { SEO_PAGES } from "@/lib/seo/pages";
import { abs } from "@/lib/seo/site";

// Only indexable, canonical URLs. Private screens (plan, start, app, share links) are noindex and stay out.
export default function sitemap(): MetadataRoute.Sitemap {
  const latest = SEO_PAGES.map((p) => p.updated).sort().at(-1)!;
  return [
    { url: abs("/"), lastModified: latest, changeFrequency: "weekly", priority: 1 },
    { url: abs("/guides"), lastModified: latest, changeFrequency: "weekly", priority: 0.8 },
    ...SEO_PAGES.map((p) => ({ url: abs(p.path), lastModified: p.updated, changeFrequency: "monthly" as const, priority: p.kind === "guide" ? 0.7 : 0.8 })),
    { url: abs("/signup"), changeFrequency: "yearly", priority: 0.4 },
    { url: abs("/login"), changeFrequency: "yearly", priority: 0.2 },
    { url: abs("/terms"), changeFrequency: "yearly", priority: 0.1 },
    { url: abs("/privacy"), changeFrequency: "yearly", priority: 0.1 },
  ];
}
