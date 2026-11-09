/* FitPlanr service worker: offline caching for the website, the Android app and the iOS app.
   - App code, fonts, icons: cache first (they are versioned by Next.js and never change).
   - Your pages (plan, workout, library, history): network first, the last copy is kept so they open offline.
   - Nothing else: no API call, no checkout, no other website is ever cached.
   Cached pages are wiped on log out (lib/native.ts → forgetDevice). */
const VERSION = "v1";
const STATIC = "fp-static-" + VERSION;
const PAGES = "fp-pages-" + VERSION;
const OFFLINE = "/offline";
const PAGE_PATHS = /^\/(app|dashboard|workout|plan|library|history|settings|account|offline)(\/|$)/;

// The offline page and every file it needs (scripts, styles, fonts) are cached up front.
async function precacheOffline() {
  const c = await caches.open(STATIC);
  const res = await fetch(OFFLINE, { cache: "reload" });
  if (!res.ok) return;
  const html = await res.clone().text();
  await c.put(OFFLINE, res);
  const files = [...new Set([...html.matchAll(/(?:src|href)="(\/_next\/static\/[^"]+)"/g)].map((m) => m[1]))];
  await Promise.all([...files, "/icon.svg"].map((f) => c.add(f).catch(() => {})));
}

self.addEventListener("install", (e) => {
  e.waitUntil(precacheOffline().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("fp-") && k !== STATIC && k !== PAGES).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

function timeout(ms) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms));
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname === "/sw.js") return;

  // versioned app code and fonts
  if (url.pathname.startsWith("/_next/static/") || url.pathname === "/icon.svg" || url.pathname.startsWith("/pwa/")) {
    e.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(STATIC).then((c) => c.put(req, copy));
            }
            return res;
          }),
      ),
    );
    return;
  }

  // full page loads
  if (req.mode === "navigate") {
    const keep = PAGE_PATHS.test(url.pathname);
    e.respondWith(
      Promise.race([fetch(req), timeout(keep ? 8000 : 20000)])
        .then((res) => {
          if (keep && res.ok && !res.redirected && res.type === "basic") {
            const copy = res.clone();
            caches.open(PAGES).then((c) => c.put(url.pathname, copy));
          }
          return res;
        })
        .catch(() => caches.match(url.pathname, { cacheName: PAGES }).then((hit) => hit || caches.match(OFFLINE))),
    );
  }
});

// The page tells us which app files it already loaded before this worker took over, so they work offline too.
self.addEventListener("message", (e) => {
  const d = e.data || {};
  if (d.type === "precache" && Array.isArray(d.urls)) {
    const urls = d.urls.filter((u) => typeof u === "string" && u.startsWith(self.location.origin + "/_next/static/")).slice(0, 120);
    e.waitUntil(caches.open(STATIC).then((c) => Promise.all(urls.map((u) => c.match(u).then((hit) => hit || c.add(u).catch(() => {}))))));
  }
  if (d.type === "clear-pages") e.waitUntil(caches.delete(PAGES));
});
