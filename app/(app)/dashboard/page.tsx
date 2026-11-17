import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Flame, RefreshCw } from "lucide-react";
import { PageTitle } from "@/components/app-shell";
import { MainButton } from "@/components/ui/button";
import { Ring } from "@/components/ui/motion";
import { LineChart } from "@/components/charts";
import { LockedPart } from "@/components/paywall/upgrade";
import { ShareButton } from "@/components/share-button";
import { getSession } from "@/lib/access";
import { requirePaid } from "@/lib/guard";
import { dayOf, nextSession, type LogRow } from "@/lib/workout";
import { e1rm } from "@/lib/engine/progression";
import { fmtDate } from "@/lib/utils";
import { ConfirmPaid } from "./confirm-paid";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false, follow: false } };

function Meter({ label, used, max }: { label: string; used: number; max: number }) {
  const pct = Math.min(100, (used / max) * 100);
  return (
    <div>
      <div className="flex justify-between text-[13px]">
        <span className="text-muted">{label}</span>
        <span className="font-semibold tabular-nums">{used} / {max}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.07]">
        <div className={pct >= 100 ? "h-full rounded-full bg-heat" : "h-full rounded-full bg-lime"} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ paid?: string; ref?: string; upgrade?: string }> }) {
  const sp = await searchParams;
  if (sp.paid && sp.ref && /^[\w\-:.]{4,128}$/.test(sp.ref)) return <ConfirmPaid refId={sp.ref} upgrade={sp.upgrade === "1"} />;

  const { access, plan } = await requirePaid();
  const { sb, user } = await getSession();
  const { data } = await sb.from("workout_logs").select("*").eq("user_id", user!.id).not("finished_at", "is", null).order("finished_at", { ascending: false }).limit(60);
  const logs = (data ?? []) as LogRow[];
  const onPlan = logs.filter((l) => l.plan_id === plan.id);
  const next = nextSession(plan.data, onPlan.length);
  const day = dayOf(plan.data, next.week, next.day)!;
  const perWeek = plan.data.weeks[0].days.length;
  const thisWeek = onPlan.filter((l) => l.week === next.week).length;
  const planPct = onPlan.length / (perWeek * 4);

  // streak: consecutive weeks (Mon-based) with at least one workout
  const weekKey = (d: Date) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
    return x.getTime();
  };
  const weeks = new Set(logs.map((l) => weekKey(new Date(l.finished_at!))));
  let streak = 0;
  for (let w = weekKey(new Date()); weeks.has(w); w -= 7 * 86400000) streak++;

  // strength line: best estimated 1-rep max per session on the first lift of Day 1
  const mainEx = plan.data.weeks[0].days[0].exercises[0];
  const series = logs
    .slice()
    .reverse()
    .map((l) => {
      const en = l.entries.find((e) => e.exId === mainEx.exId);
      if (!en) return null;
      const best = Math.max(0, ...en.sets.filter((s) => s.done).map((s) => (s.load ? e1rm(s.load, s.reps) : s.reps)));
      return best ? { x: new Date(l.finished_at!).toLocaleDateString("en-US", { month: "short", day: "numeric" }), y: best } : null;
    })
    .filter(Boolean) as { x: string; y: number }[];
  const demo = [
    { x: "Wk 1", y: 40 },
    { x: "", y: 42 },
    { x: "", y: 45 },
    { x: "", y: 47 },
    { x: "Wk 4", y: 50 },
  ];

  return (
    <div>
      <PageTitle label="Dashboard" title={onPlan.length ? "Keep it going" : "Day 1 is ready"}>
        {plan.share_id && <ShareButton path={`/s/${plan.share_id}`} title={plan.data.title} />}
      </PageTitle>

      <section className="relative overflow-hidden rounded-[24px] border border-line-2 bg-card p-5 sm:p-7">
        <div className="top-glow pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-lime">Up next · Week {next.week} · Day {next.day}</div>
            <div className="display mt-2 text-[34px]">{day.name}</div>
            <div className="mt-1 text-[15px] text-muted">
              {day.exercises.length} moves · {day.minutes} min · starts with {day.exercises[0]?.name}
            </div>
          </div>
          <MainButton href="/workout">Start workout</MainButton>
        </div>
      </section>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-[20px] border border-line bg-card p-5">
          <Ring value={thisWeek / perWeek} size={68} stroke={7}>
            <span className="font-display text-xl font-bold">{thisWeek}/{perWeek}</span>
          </Ring>
          <div>
            <div className="text-[15px] font-semibold">This week</div>
            <div className="text-[13px] text-muted">Week {next.week} of 4</div>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-[20px] border border-line bg-card p-5">
          <Ring value={planPct} size={68} stroke={7}>
            <span className="font-display text-xl font-bold">{Math.round(planPct * 100)}%</span>
          </Ring>
          <div>
            <div className="text-[15px] font-semibold">Plan done</div>
            <div className="text-[13px] text-muted">{onPlan.length} of {perWeek * 4} workouts</div>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-[20px] border border-line bg-card p-5">
          <span className="flex h-[68px] w-[68px] items-center justify-center rounded-full bg-heat/15 text-heat"><Flame size={30} /></span>
          <div>
            <div className="text-[15px] font-semibold">{streak} week streak</div>
            <div className="text-[13px] text-muted">{streak ? "Don't break it" : "Train this week to start one"}</div>
          </div>
        </div>
      </div>

      <section className="mt-4 rounded-[20px] border border-line bg-card p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[16px] font-semibold">{mainEx.name}: strength</div>
            <div className="text-[13px] text-muted">Estimated 1-rep max from your logged sets</div>
          </div>
        </div>
        <div className="mt-4">
          {access.quota.charts ? (
            <LineChart points={series} />
          ) : (
            <LockedPart label="Unlock strength charts with Pro" target="pro">
              <LineChart points={demo} />
            </LockedPart>
          )}
        </div>
      </section>

      <section className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="space-y-4 rounded-[20px] border border-line bg-card p-5 sm:p-6">
          <div className="text-[16px] font-semibold">This billing month</div>
          <Meter label="Workouts logged" used={access.usage.workouts} max={access.quota.workouts} />
          <Meter label="Plan rebuilds" used={access.usage.rebuilds} max={access.quota.rebuilds} />
          <Link href="/settings" className="inline-flex items-center gap-1.5 text-[14px] text-muted hover:text-fg"><RefreshCw size={14} /> Rebuild my plan</Link>
        </div>
        <div className="rounded-[20px] border border-line bg-card p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="text-[16px] font-semibold">Recent workouts</div>
            <Link href="/history" className="flex items-center gap-1 text-[13px] text-muted hover:text-fg">All <ArrowRight size={13} /></Link>
          </div>
          {logs.length === 0 ? (
            <p className="mt-4 text-[14px] text-muted">Your finished workouts show up here.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {logs.slice(0, 4).map((l) => (
                <li key={l.id} className="flex items-center justify-between py-3 text-[14px]">
                  <span className="font-medium">{l.day_name ?? `Day ${l.day}`}</span>
                  <span className="text-muted">{fmtDate(l.finished_at!)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
      <p className="mt-6 text-center text-[13px] text-dim">
        <Link href="/plan" className="hover:text-muted">See the full 4-week plan</Link>
      </p>
    </div>
  );
}
