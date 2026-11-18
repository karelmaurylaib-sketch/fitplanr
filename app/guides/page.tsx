import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { MainButton } from "@/components/ui/button";
import { TopBar, StickyCta, Footer, KwopFlow } from "@/components/landing/chrome";
import { JsonLd } from "@/components/seo/json-ld";
import { GUIDES_HUB, KIND_NAME, SEO_PAGES, type SeoKind } from "@/lib/seo/pages";
import { abs, breadcrumbLd } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: { absolute: GUIDES_HUB.title },
  description: GUIDES_HUB.description,
  alternates: { canonical: GUIDES_HUB.path },
  openGraph: { url: abs(GUIDES_HUB.path), title: GUIDES_HUB.title, description: GUIDES_HUB.description, images: [{ url: "/og/guides", width: 1200, height: 630, alt: GUIDES_HUB.h1 }] },
  twitter: { card: "summary_large_image", images: ["/og/guides"] },
};

const ORDER: SeoKind[] = ["guide", "for", "alternative", "vs"];

export default function GuidesHub() {
  const ld = [
    breadcrumbLd([{ name: "Home", path: "/" }, { name: "Guides", path: "/guides" }]),
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: GUIDES_HUB.h1,
      url: abs(GUIDES_HUB.path),
      hasPart: SEO_PAGES.map((p) => ({ "@type": "WebPage", name: p.h1, url: abs(p.path) })),
    },
  ];
  return (
    <main className="relative overflow-x-clip">
      <KwopFlow />
      <JsonLd data={ld} />
      <TopBar home={false} />
      <header className="relative pt-[104px] sm:pt-[132px]">
        <div className="dot-grid pointer-events-none absolute inset-0 h-[460px]" />
        <div className="top-glow pointer-events-none absolute inset-0 h-[420px]" />
        <div className="relative mx-auto max-w-[860px] px-5">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[13px] text-muted">
            <Link href="/" className="hover:text-fg">Home</Link>
            <ChevronRight size={13} className="text-dim" aria-hidden />
            <span aria-current="page" className="text-fg/70">Guides</span>
          </nav>
          <div className="label mt-8">[ Guides ]</div>
          <h1 className="display mt-4 text-[44px] leading-[0.95] sm:text-[72px]">{GUIDES_HUB.h1}</h1>
          <p className="mt-5 max-w-[620px] text-[17px] leading-relaxed text-fg/80">
            Plain answers for people who want to build muscle without a coach. Every example on these pages is real output from FitPlanr&apos;s plan engine.
          </p>
        </div>
      </header>
      <div className="mx-auto mt-12 max-w-[860px] space-y-12 px-5">
        {ORDER.map((k) => {
          const list = SEO_PAGES.filter((p) => p.kind === k);
          if (!list.length) return null;
          return (
            <section key={k} aria-labelledby={`h-${k}`}>
              <h2 id={`h-${k}`} className="display text-[30px] sm:text-[40px]">{KIND_NAME[k]}</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {list.map((p) => (
                  <li key={p.path}>
                    <Link href={p.path} className="press block h-full rounded-[18px] border border-line bg-card p-5 hover:border-white/20">
                      <div className="text-[17px] font-semibold">{p.link}</div>
                      <p className="mt-1 text-[14px] leading-snug text-muted">{p.blurb}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
      <section className="px-5 py-24 text-center">
        <h2 className="display text-[40px] sm:text-[56px]">Skip the reading.<span className="grad-2 block">Get the plan.</span></h2>
        <div className="mt-7 flex justify-center"><MainButton href="/signup">Build my plan</MainButton></div>
      </section>
      <Footer />
      <StickyCta href="/signup" />
    </main>
  );
}
