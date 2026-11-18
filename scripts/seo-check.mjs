// SEO check for every public page: status, one <title> ≤ 60, one meta description ≤ 155, exactly one <h1>,
// canonical = the page's own URL, valid JSON-LD, sitemap lists the page, private screens are noindex.
// Usage: BASE_URL=https://fitplanr-3.vercel.app node scripts/seo-check.mjs   (default http://localhost:3000)

const base = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const site = (process.env.SITE_URL || base).replace(/\/$/, "");

const PUBLIC = [
  "/",
  "/guides",
  "/for/beginners",
  "/for/home-dumbbells",
  "/vs/hevy-vs-strong",
  "/alternatives/fitbod",
  "/alternatives/strong",
  "/guides/progressive-overload-with-dumbbells",
  "/guides/3-day-full-body-workout-for-beginners",
  "/guides/how-to-start-lifting-weights",
  "/signup",
  "/login",
  "/terms",
  "/privacy",
];
const PRIVATE = ["/forgot", "/reset"];

const all = (re, s) => [...s.matchAll(re)];
const attr = (tag, name) => (tag.match(new RegExp(`${name}="([^"]*)"`)) || [])[1];
const decode = (s) => s.replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");

let fails = 0;
const bad = (path, msg) => {
  fails++;
  console.log(`  ✗ ${path}: ${msg}`);
};

const sitemap = await (await fetch(base + "/sitemap.xml")).text();
const inSitemap = new Set(all(/<loc>([^<]+)<\/loc>/g, sitemap).map((m) => m[1]));
console.log(`sitemap.xml: ${inSitemap.size} URLs`);
const robots = await (await fetch(base + "/robots.txt")).text();
console.log("robots.txt:", robots.replace(/\n/g, " | "));

for (const path of PUBLIC) {
  const res = await fetch(base + path, { redirect: "manual" });
  const html = await res.text();
  if (res.status !== 200) {
    bad(path, `status ${res.status}`);
    continue;
  }
  const titles = all(/<title>([^<]*)<\/title>/g, html).map((m) => decode(m[1]));
  const descTags = all(/<meta name="description"[^>]*>/g, html);
  const desc = descTags[0] ? decode(attr(descTags[0][0], "content") || "") : "";
  const h1 = all(/<h1[\s>]/g, html).length;
  const canonTag = (html.match(/<link rel="canonical"[^>]*>/) || [""])[0];
  const canon = attr(canonTag, "href");
  const robotsMeta = (html.match(/<meta name="robots" content="([^"]*)"/) || [])[1] || "";
  const ogImage = (html.match(/<meta property="og:image" content="([^"]*)"/) || [])[1];
  const ld = all(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g, html).map((m) => m[1]);
  const types = [];
  for (const block of ld) {
    try {
      const j = JSON.parse(block);
      types.push(j["@type"]);
      if (j["@type"] === "SoftwareApplication" && !Array.isArray(j.offers)) bad(path, "SoftwareApplication without offers");
      if (j["@type"] === "FAQPage" && !j.mainEntity?.length) bad(path, "FAQPage empty");
    } catch (e) {
      bad(path, "JSON-LD does not parse: " + e.message);
    }
  }
  if (titles.length !== 1) bad(path, `${titles.length} <title>`);
  if ((titles[0] || "").length > 60) bad(path, `title ${titles[0].length} chars`);
  if (descTags.length !== 1) bad(path, `${descTags.length} meta descriptions`);
  if (!desc || desc.length > 155) bad(path, `description ${desc.length} chars`);
  if (h1 !== 1) bad(path, `${h1} <h1>`);
  const want = site + (path === "/" ? "" : path);
  if (canon !== want && canon !== site + path) bad(path, `canonical ${canon} (want ${want})`);
  if (/noindex/.test(robotsMeta)) bad(path, "noindex on a public page");
  if (!ogImage) bad(path, "no og:image");
  if (!["/signup", "/login", "/terms", "/privacy"].includes(path) && !inSitemap.has(want) && !inSitemap.has(site + path)) bad(path, "missing from sitemap");
  console.log(`✓ ${path}\n    title (${titles[0]?.length}): ${titles[0]}\n    desc (${desc.length}): ${desc}\n    canonical: ${canon} · JSON-LD: ${types.join(", ") || "none"}`);
}

for (const path of PRIVATE) {
  const html = await (await fetch(base + path)).text();
  if (!/<meta name="robots" content="noindex/.test(html)) bad(path, "private page without noindex");
  else console.log(`✓ ${path} noindex`);
}

const nf = await fetch(base + "/this-page-does-not-exist");
if (nf.status !== 404) bad("/404", `status ${nf.status}`);
else console.log("✓ unknown URL returns 404");

const og = await fetch(base + "/og/for/beginners");
if (og.status !== 200 || !String(og.headers.get("content-type")).includes("image/png")) bad("/og/for/beginners", `status ${og.status} ${og.headers.get("content-type")}`);
else console.log("✓ per-page OG image renders");

console.log(fails ? `\n${fails} problem(s)` : "\nAll SEO checks passed");
process.exit(fails ? 1 : 0);
