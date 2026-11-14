// Search-engine rules, shared by middleware, robots.ts and sitemap.ts.
// Every page route is PUBLIC (indexed, in the sitemap) unless it starts with one of these prefixes.
export const PRIVATE_PREFIXES = [
  "/api", "/auth", "/admin", "/checkout",
  "/signup", "/login", "/forgot", "/reset",
  "/start", "/plan",
  "/dashboard", "/workout", "/history", "/settings", "/account", "/library", "/pricing",
  "/pwa",
];

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");

export function isPrivatePath(pathname: string) {
  return PRIVATE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export function canonical(pathname: string) {
  return SITE_URL + (pathname === "/" ? "" : pathname);
}
