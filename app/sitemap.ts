import type { MetadataRoute } from "next";
import fs from "node:fs";
import path from "node:path";
import { canonical, isPrivatePath } from "@/lib/seo";

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

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [...new Set(routes(path.join(process.cwd(), "app")))]
    .filter((p) => !isPrivatePath(p))
    .sort()
    .map((p) => ({ url: canonical(p), lastModified: now, changeFrequency: "weekly", priority: p === "/" ? 1 : 0.5 }));
}
