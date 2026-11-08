import type { KwopPlan } from "@/lib/kwop";

// Everything search engines read about FitPlanr: absolute URLs and the JSON-LD blocks.
// Prices are never written here: they come from GET KWOP_API at render time.

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
export const SITE_NAME = "FitPlanr";

export const abs = (path: string) => (path === "/" ? SITE_URL : SITE_URL + path);

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: abs("/"),
    logo: `${SITE_URL}/pwa/512`,
    description: "FitPlanr builds safe, progressive 4-week workout plans from the gear you actually have.",
  };
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: abs("/"),
    inLanguage: "en-US",
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

/** SoftwareApplication with one Offer per Kwop plan (monthly and yearly), plus the free first plan. */
export function softwareLd(plans: KwopPlan[]) {
  const offers: Record<string, unknown>[] = [
    { "@type": "Offer", name: "Free try: your plan built, Week 1 Day 1 in full", price: "0", priceCurrency: "USD", url: abs("/signup") },
  ];
  for (const p of plans) {
    const name = p.name.replace(/^fitplanr\s*/i, "") || p.name;
    const cur = (p.currency || "USD").toUpperCase();
    offers.push({
      "@type": "Offer",
      name: `${name} (monthly)`,
      price: (p.price_cents / 100).toFixed(2),
      priceCurrency: cur,
      url: abs("/signup"),
      priceSpecification: { "@type": "UnitPriceSpecification", price: (p.price_cents / 100).toFixed(2), priceCurrency: cur, billingDuration: "P1M" },
    });
    if (p.yearly)
      offers.push({
        "@type": "Offer",
        name: `${name} (yearly)`,
        price: (p.yearly.price_cents / 100).toFixed(2),
        priceCurrency: cur,
        url: abs("/signup"),
        priceSpecification: { "@type": "UnitPriceSpecification", price: (p.yearly.price_cents / 100).toFixed(2), priceCurrency: cur, billingDuration: "P1Y" },
      });
  }
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${SITE_URL}/#app`,
    name: SITE_NAME,
    url: abs("/"),
    applicationCategory: "HealthApplication",
    applicationSubCategory: "Workout planner",
    operatingSystem: "Web (any phone or computer browser)",
    inLanguage: "en-US",
    description: "Pick the gear you have and get a safe 4-week workout plan with automatic progression, a set logger and a form library.",
    publisher: { "@id": `${SITE_URL}/#organization` },
    offers,
  };
}

export function faqLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((x) => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a } })),
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((x, i) => ({ "@type": "ListItem", position: i + 1, name: x.name, item: abs(x.path) })),
  };
}

export function articleLd(p: { path: string; title: string; description: string; published: string; updated: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: p.title,
    description: p.description,
    mainEntityOfPage: abs(p.path),
    datePublished: p.published,
    dateModified: p.updated,
    inLanguage: "en-US",
    image: abs(`/og${p.path}`),
    author: { "@id": `${SITE_URL}/#organization` },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}
