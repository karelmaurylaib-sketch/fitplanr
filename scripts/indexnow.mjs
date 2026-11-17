// IndexNow: tells Bing (and Yandex, Seznam, Naver… which share it) that every public URL is new or changed.
// Runs by itself after each production build on Vercel ("postbuild"), and by hand: `npm run indexnow`.
// URLs come from the sitemap (the built one if present, otherwise the live one), so it never needs a list.
// Never fails a build: any error is only logged.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const site = (process.env.NEXT_PUBLIC_SITE_URL || "https://fitplanr-3.vercel.app").replace(/\/+$/, "");

async function main() {
  if (process.env.npm_lifecycle_event === "postbuild" && process.env.VERCEL_ENV !== "production") {
    console.log("[indexnow] skipped (not a production build)");
    return;
  }
  if (!/^https:\/\//.test(site)) return console.log(`[indexnow] skipped (site is ${site})`);

  const keyFile = fs.readdirSync(path.join(root, "public")).find((f) => /^[a-f0-9]{32}\.txt$/.test(f));
  if (!keyFile) return console.log("[indexnow] no key file in public/");
  const key = keyFile.slice(0, -4);

  const built = path.join(root, ".next/server/app/sitemap.xml.body");
  const xml = fs.existsSync(built) ? fs.readFileSync(built, "utf8") : await (await fetch(`${site}/sitemap.xml`)).text();
  const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  if (!urlList.length) return console.log("[indexnow] sitemap has no URLs");

  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: new URL(site).host, key, keyLocation: `${site}/${keyFile}`, urlList }),
  });
  // 200 = accepted, 202 = accepted, key check pending. 403/422 = key file not reachable or URLs not on host.
  console.log(`[indexnow] ${res.status} for ${urlList.length} URLs:\n  ${urlList.join("\n  ")}`);
}

main().catch((e) => console.log("[indexnow] error (ignored):", e.message));
