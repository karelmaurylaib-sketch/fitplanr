// Tell Bing, Yandex, Seznam and other IndexNow engines about new or updated URLs (Google does not use IndexNow:
// submit the sitemap in Search Console instead). The key file lives at public/<key>.txt.
// Usage: node scripts/indexnow.mjs [url ...]   (no args = every URL in the live sitemap)
const KEY = "2d74ddb9fd6087440e78c2c7f4404395";
const SITE = (process.env.SITE_URL || "https://fitplanr-3.vercel.app").replace(/\/$/, "");
let urls = process.argv.slice(2);
if (!urls.length) {
  const xml = await (await fetch(SITE + "/sitemap.xml")).text();
  urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}
const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: new URL(SITE).host, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList: urls }),
});
console.log("IndexNow", res.status, res.statusText, "·", urls.length, "URLs");
