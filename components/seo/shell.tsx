import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { MainButton } from "@/components/ui/button";
import { TopBar, StickyCta, Faq, Footer, KwopFlow } from "@/components/landing/chrome";
import { JsonLd } from "./json-ld";
import { PAGE_BY_PATH, type SeoPage } from "@/lib/seo/pages";
import { articleLd, breadcrumbLd, faqLd, softwareLd } from "@/lib/seo/site";
import { getPlansCached } from "@/lib/kwop";

const CTA = "/signup";

const fmtDay = (iso: string) => new Date(iso + "T12:00:00Z").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

export function crumbsFor(p: SeoPage) {
  const mid =
    p.kind === "guide" ? { name: "Guides", path: "/guides" } : null;
  return [{ name: "Home", path: "/" }, ...(mid ? [mid] : []), { name: p.link, path: p.path }];
}

/** The frame of every keyword-map page: answer first, the product's real output, FAQ, related pages, the main button. */
export async function SeoShell({ path, answer, children }: { path: string; answer: ReactNode; children: ReactNode }) {
  const p = PAGE_BY_PATH[path];
  const crumbs = crumbsFor(p);
  const ld: Record<string, unknown>[] = [breadcrumbLd(crumbs), faqLd(p.faq)];
  if (p.kind === "guide") ld.push(articleLd({ path: p.path, title: p.title, description: p.description, published: p.published, updated: p.updated }));
  else ld.push(softwareLd(await getPlansCached()));
  const related = p.related.map((r) => PAGE_BY_PATH[r]).filter(Boolean);

  return (
    <main className="relative overflow-x-clip">
      <KwopFlow />
      <JsonLd data={ld} />
      <TopBar cta={CTA} home={false} />

      <header className="relative pt-[104px] sm:pt-[132px]">
        <div className="dot-grid pointer-events-none absolute inset-0 h-[520px]" />
        <div className="top-glow pointer-events-none absolute inset-0 h-[480px]" />
        <div className="relative mx-auto max-w-[760px] px-5">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1 text-[13px] text-muted">
              {crumbs.map((c, i) => (
                <li key={c.path} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight size={13} className="text-dim" aria-hidden />}
                  {i < crumbs.length - 1 ? (
                    <Link href={c.path} className="hover:text-fg">{c.name}</Link>
                  ) : (
                    <span aria-current="page" className="text-fg/70">{c.name}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
          <div className="label mt-8">[ {p.label} ]</div>
          <h1 className="display mt-4 text-[42px] leading-[0.95] sm:text-[64px]">{p.h1}</h1>
          <div className="mt-6 rounded-[20px] border border-lime/25 bg-lime/[0.05] p-5 text-[17px] leading-relaxed text-fg/90 sm:p-6">{answer}</div>
          <div className="mt-7 flex flex-col items-start gap-3">
            <MainButton href={CTA} className="w-full sm:w-auto">Build my plan</MainButton>
            <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-muted">Free to try · No card · Ready in 60 seconds</p>
          </div>
          <p className="mt-6 text-[13px] text-dim">
            By the FitPlanr team · Updated <time dateTime={p.updated}>{fmtDay(p.updated)}</time>
          </p>
        </div>
      </header>

      <article className="seo-prose mx-auto mt-12 max-w-[760px] px-5">{children}</article>

      <section className="mx-auto mt-16 max-w-[760px] px-5" aria-labelledby="faq">
        <div className="label">[ Questions ]</div>
        <h2 id="faq" className="display mb-6 mt-3 text-[36px] sm:text-[48px]">Quick answers</h2>
        <Faq items={p.faq} />
      </section>

      {related.length > 0 && (
        <nav className="mx-auto mt-16 max-w-[760px] px-5" aria-labelledby="related">
          <h2 id="related" className="label">[ Keep reading ]</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {related.map((r) => (
              <li key={r.path}>
                <Link href={r.path} className="press block h-full rounded-[18px] border border-line bg-card p-4 hover:border-white/20">
                  <div className="text-[15px] font-semibold">{r.link}</div>
                  <p className="mt-1 text-[13px] leading-snug text-muted">{r.blurb}</p>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <section className="relative overflow-hidden px-5 pb-24 pt-20 sm:pb-32">
        <div className="top-glow pointer-events-none absolute inset-x-0 top-0 h-[420px] rotate-180 opacity-60" />
        <div className="relative mx-auto max-w-[760px] text-center">
          <h2 className="display text-[40px] sm:text-[64px]">
            Your gear. Your days.
            <span className="grad-2 block">Your 4-week plan.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[16px] text-muted">Answer 5 one-tap questions, pick your gear, and see Day 1 of your plan in about a minute.</p>
          <div className="mt-7 flex justify-center">
            <MainButton href={CTA}>Build my plan</MainButton>
          </div>
        </div>
      </section>

      <Footer />
      <StickyCta href={CTA} />
    </main>
  );
}

/** FitPlanr's live prices (GET KWOP_API, cached 1 h). Never hardcoded. */
export async function FitPlanrPrices() {
  const plans = await getPlansCached();
  if (!plans.length) return <>Free to try; plans are shown once your plan is built</>;
  const sorted = [...plans].sort((a, b) => a.price_cents - b.price_cents);
  return (
    <>
      {sorted
        .map((p) => `${p.name.replace(/^fitplanr\s*/i, "")} $${(p.price_cents / 100).toFixed(2)}/mo${p.yearly ? ` or $${(p.yearly.price_cents / 100).toFixed(0)}/yr` : ""}`)
        .join(" · ")}
      . Building your plan and seeing Day 1 is free.
    </>
  );
}

/** A plain, honest comparison table. */
export function CompareTable({ head, rows, caption }: { head: string[]; rows: (string | ReactNode)[][]; caption?: ReactNode }) {
  return (
    <figure className="not-prose my-8 overflow-hidden rounded-[22px] border border-line-2 bg-card">
      {/* phone: one card per row, every value labelled */}
      <dl className="divide-y divide-line sm:hidden">
        {rows.map((r, i) => (
          <div key={i} className="px-4 py-3.5">
            <dt className="text-[13px] font-semibold uppercase tracking-wide text-muted">{r[0]}</dt>
            {r.slice(1).map((c, j) => (
              <dd key={j} className="mt-1.5 text-[14px] leading-snug text-fg/85">
                {head[j + 1] && <span className={`font-semibold ${head[j + 1] === "FitPlanr" ? "text-lime" : "text-fg"}`}>{head[j + 1]}: </span>}
                {c}
              </dd>
            ))}
          </div>
        ))}
      </dl>
      <table className="hidden w-full text-left text-[14px] sm:table">
        <thead>
          <tr className="border-b border-line">
            {head.map((h, i) => (
              <th key={i} scope="col" className={`px-4 py-3 font-semibold ${i === 0 ? "text-muted" : ""} ${h === "FitPlanr" ? "text-lime" : ""}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-line align-top">
              {r.map((c, j) => (
                j === 0 ? <th key={j} scope="row" className="px-4 py-3 font-medium text-muted">{c}</th> : <td key={j} className="px-4 py-3 text-fg/85">{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {caption && <figcaption className="border-t border-line px-4 py-3 text-[12px] text-dim">{caption}</figcaption>}
    </figure>
  );
}

export { PAGE_BY_PATH };
