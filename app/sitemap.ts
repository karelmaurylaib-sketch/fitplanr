import type { MetadataRoute } from "next";
import fs from "node:fs";
import path from "node:path";
import { canonical, isPrivatePath } from "@/lib/seo/rules";
import { PAGE_BY_PATH, SEO_PAGES } from "@/lib/seo/pages";

// Built at deploy time from the app/ folder: any new page.tsx outside the private list gets in by itself.
export const dynamic = "force-static";

function routes(dir: string, base = ""): string[] {
  const out: string[] = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isFile() && /^page\.(tsx|ts|jsx|js|mdx)$/.test(e.name)) out.push(base || "/");
    if (!e.isDirectory()) continue;
    const n = e.name;
    if (n.startsWith("_") || n.startsWith("@") || n.startsWith("[")) continue; // private folders, slots, dynamic segments
    const seg = n.startsWith("(") && n.endsWith(")") ? "" : "/" + n; // route groups add no segment
    out.push(...routes(path.join(dir, n), base + seg));
  }
  return out;
}

// Keyword-map pages carry their own "updated" date (lib/seo/pages.ts); home and /guides change whenever any of them does.
const LEGAL = ["/terms", "/privacy"];

export default function sitemap(): MetadataRoute.Sitemap {
  const latest = SEO_PAGES.map((p) => p.updated).sort().at(-1)!;
  return [...new Set(routes(path.join(process.cwd(), "app")))]
    .filter((p) => !isPrivatePath(p))
    .sort()
    .map((p) => {
      const page = PAGE_BY_PATH[p];
      if (page) return { url: canonical(p), lastModified: page.updated, changeFrequency: "monthly" as const, priority: page.kind === "guide" ? 0.7 : 0.8 };
      if (LEGAL.includes(p)) return { url: canonical(p), changeFrequency: "yearly" as const, priority: 0.1 };
      return { url: canonical(p), lastModified: latest, changeFrequency: "weekly" as const, priority: p === "/" ? 1 : 0.6 };
    });
}
