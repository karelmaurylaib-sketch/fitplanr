import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Logo } from "@/components/logo";
import { MainButton } from "@/components/ui/button";
import { KwopFlow } from "@/components/landing/chrome";
import { getShared } from "@/lib/share";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const s = await getShared(id);
  if (!s) return { title: "Plan not found" };
  return { title: `${s.title}: a FitPlanr plan`, description: s.summary, openGraph: { title: `${s.title} · FitPlanr`, description: s.summary } };
}

export default async function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await getShared(id);
  if (!s) notFound();
  return (
    <main className="relative mx-auto min-h-dvh max-w-[620px] px-5 py-8">
      <KwopFlow />
      <div className="top-glow pointer-events-none absolute inset-0" />
      <div className="relative">
        <Logo />
        <div className="label mt-12">[ Built with FitPlanr ]</div>
        <h1 className="display mt-3 text-[48px] sm:text-[64px]">{s.title}</h1>
        <p className="mt-2 text-[17px] text-fg/80">{s.summary}</p>
        <section className="mt-8 rounded-[22px] border border-line-2 bg-card p-5">
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-lime">Day 1 · {s.day1.name}</div>
          <ul className="mt-3 divide-y divide-line">
            {s.day1.exercises.map((e) => (
              <li key={e.slot} className="flex justify-between gap-3 py-3 text-[15px]">
                <span className="font-medium">{e.name}</span>
                <span className="text-muted">{e.sets} × {e.target}{e.unit === "sec" ? " s" : ""}</span>
              </li>
            ))}
          </ul>
        </section>
        <div className="mt-10 rounded-[22px] border border-line bg-card p-6 text-center">
          <h2 className="display text-[32px]">Want one built on your gear?</h2>
          <p className="mt-2 text-muted">Free to try · No card · Ready in 60 seconds</p>
          <div className="mt-5 flex justify-center"><MainButton href="/signup">Build my plan</MainButton></div>
        </div>
      </div>
    </main>
  );
}
