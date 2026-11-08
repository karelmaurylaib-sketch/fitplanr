import type { Metadata } from "next";
import { PageTitle } from "@/components/app-shell";
import { getSession } from "@/lib/access";
import { requirePaid } from "@/lib/guard";
import type { LogRow } from "@/lib/workout";
import { e1rm } from "@/lib/engine/progression";
import { HistoryList } from "./list";

export const metadata: Metadata = { title: "History" };

export default async function HistoryPage() {
  const { access } = await requirePaid();
  const { sb, user } = await getSession();
  let q = sb.from("workout_logs").select("*").eq("user_id", user!.id).not("finished_at", "is", null).order("finished_at", { ascending: false }).limit(200);
  const days = access.quota.historyDays;
  if (days) q = q.gte("finished_at", new Date(Date.now() - days * 86400000).toISOString());
  const { data } = await q;
  const logs = (data ?? []) as LogRow[];
  let hidden = 0;
  if (days) {
    const { count } = await sb.from("workout_logs").select("id", { count: "exact", head: true }).eq("user_id", user!.id).not("finished_at", "is", null).lt("finished_at", new Date(Date.now() - days * 86400000).toISOString());
    hidden = count ?? 0;
  }
  // per-exercise strength series (oldest first)
  const series: Record<string, { name: string; points: { x: string; y: number }[] }> = {};
  for (const l of [...logs].reverse())
    for (const en of l.entries) {
      const best = Math.max(0, ...en.sets.filter((s) => s.done).map((s) => (s.load ? e1rm(s.load, s.reps) : s.reps)));
      if (!best) continue;
      series[en.exId] ??= { name: en.name, points: [] };
      series[en.exId].points.push({ x: new Date(l.finished_at!).toLocaleDateString("en-US", { month: "short", day: "numeric" }), y: best });
    }
  return (
    <div>
      <PageTitle label="History" title="Your numbers" />
      <HistoryList logs={logs} series={series} charts={access.quota.charts} exportCsv={access.quota.exportCsv} hidden={hidden} historyDays={days} />
    </div>
  );
}
