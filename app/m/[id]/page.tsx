import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Logo } from "@/components/logo";
import { MainButton } from "@/components/ui/button";
import { KwopFlow } from "@/components/landing/chrome";
import { getSharedMeal } from "@/lib/share";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const m = await getSharedMeal(id);
  if (!m) return { title: "Meal not found" };
  const d = `${m.kcal} kcal · ${m.protein} g protein · ${m.carbs} g carbs · ${m.fat} g fat`;
  return { title: `${m.title}: ${m.kcal} kcal`, description: d, openGraph: { title: `${m.title} · FitPlanr meal scan`, description: d } };
}

export default async function SharedMeal({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const m = await getSharedMeal(id);
  if (!m) notFound();
  return (
    <main className="relative mx-auto min-h-dvh max-w-[620px] px-5 py-8">
      <KwopFlow />
      <div className="top-glow pointer-events-none absolute inset-0" />
      <div className="relative">
        <Logo />
        <div className="label mt-12">[ Meal scan · FitPlanr ]</div>
        <h1 className="display mt-3 text-[48px] sm:text-[64px]">{m.title}</h1>
        <div className="mt-6 grid grid-cols-4 gap-2">
          {[
            ["kcal", m.kcal, "#F4F5F0"],
            ["protein", `${m.protein} g`, "#C8FF3D"],
            ["carbs", `${m.carbs} g`, "#7EE787"],
            ["fat", `${m.fat} g`, "#3FD3A6"],
          ].map(([k, v, c]) => (
            <div key={k as string} className="rounded-2xl border border-line bg-card p-3 text-center">
              <div className="font-display text-[26px] font-bold tabular-nums" style={{ color: c as string }}>{v}</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">{k}</div>
            </div>
          ))}
        </div>
        <section className="mt-4 rounded-[22px] border border-line-2 bg-card p-5">
          <ul className="divide-y divide-line">
            {m.items.map((i, k) => (
              <li key={k} className="flex justify-between gap-3 py-3 text-[15px]">
                <span>
                  <span className="block font-medium">{i.name}</span>
                  <span className="block text-[13px] text-muted">{i.portion}</span>
                </span>
                <span className="text-right text-muted">{i.kcal} kcal · {i.protein} g protein</span>
              </li>
            ))}
          </ul>
        </section>
        <div className="mt-10 rounded-[22px] border border-line bg-card p-6 text-center">
          <h2 className="display text-[32px]">Train and eat to grow</h2>
          <p className="mt-2 text-muted">A 4-week plan built on your gear, plus meals sized for your goal.</p>
          <div className="mt-5 flex justify-center"><MainButton href="/signup">Build my plan</MainButton></div>
        </div>
      </div>
    </main>
  );
}
