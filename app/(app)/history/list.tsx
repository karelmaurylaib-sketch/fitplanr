"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Download, Dumbbell, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LineChart } from "@/components/charts";
import { LockedPart, useUpgrade } from "@/components/paywall/upgrade";
import type { LogRow } from "@/lib/workout";
import { cn, fmtDate } from "@/lib/utils";

export function HistoryList({ logs, series, charts, exportCsv, hidden, historyDays }: { logs: LogRow[]; series: Record<string, { name: string; points: { x: string; y: number }[] }>; charts: boolean; exportCsv: boolean; hidden: number; historyDays: number | null }) {
  const router = useRouter();
  const { open: upgrade } = useUpgrade();
  const [openId, setOpenId] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const keys = Object.keys(series).sort((a, b) => series[b].points.length - series[a].points.length);
  const [ex, setEx] = useState(keys[0] ?? "");

  async function remove(id: string) {
    if (!confirm("Delete this workout? This can't be undone.")) return;
    setBusy(id);
    setErr("");
    const r = await fetch(`/api/workouts/${id}`, { method: "DELETE" }).catch(() => null);
    setBusy(null);
    if (!r || !r.ok) return setErr("We couldn't delete it. Try again.");
    router.refresh();
  }

  if (logs.length === 0)
    return (
      <div className="flex flex-col items-center rounded-[22px] border border-dashed border-line px-6 py-16 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lime/10 text-lime"><Dumbbell size={24} /></span>
        <p className="mt-4 text-[16px]">No workouts yet. Your first one takes about {"<"}45 minutes.</p>
        <Link href="/workout" className="press mt-5 inline-flex h-12 items-center rounded-full bg-lime px-6 font-semibold text-lime-ink">Start a workout</Link>
      </div>
    );

  const chart = series[ex];
  return (
    <div className="space-y-4">
      <section className="rounded-[20px] border border-line bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-[16px] font-semibold">Strength by exercise</div>
          {charts && keys.length > 0 && (
            <select value={ex} onChange={(e) => setEx(e.target.value)} className="h-10 rounded-full border border-line-2 bg-black/40 px-4 text-[14px] outline-none focus:border-lime/60" aria-label="Exercise">
              {keys.map((k) => <option key={k} value={k}>{series[k].name}</option>)}
            </select>
          )}
        </div>
        <div className="mt-4">
          {charts ? (
            chart ? <LineChart points={chart.points} /> : null
          ) : (
            <LockedPart label="Unlock strength charts with Pro" target="pro">
              <LineChart points={[{ x: "Wk 1", y: 40 }, { x: "", y: 44 }, { x: "", y: 45 }, { x: "Wk 4", y: 50 }]} />
            </LockedPart>
          )}
        </div>
      </section>

      <div className="flex items-center justify-between">
        <div className="text-[16px] font-semibold">{logs.length} workout{logs.length > 1 ? "s" : ""}{historyDays ? ` in the last ${historyDays} days` : ""}</div>
        {exportCsv ? (
          <a href="/api/export" className="press inline-flex h-10 items-center gap-2 rounded-full border border-line-2 px-4 text-[14px] hover:bg-white/[0.06]"><Download size={15} /> Export CSV</a>
        ) : (
          <button onClick={() => upgrade("Export every set with Elite", "elite")} className="press inline-flex h-10 items-center gap-2 rounded-full border border-line px-4 text-[14px] text-muted hover:text-fg"><Download size={15} /> Export · Elite</button>
        )}
      </div>
      {err && <p className="text-[14px] text-danger">{err}</p>}
      <ul className="space-y-2">
        {logs.map((l) => {
          const open = openId === l.id;
          const sets = l.entries.reduce((n, e) => n + e.sets.filter((s) => s.done).length, 0);
          return (
            <li key={l.id} className="rounded-[18px] border border-line bg-card">
              <button onClick={() => setOpenId(open ? null : l.id)} aria-expanded={open} className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left">
                <div>
                  <div className="text-[16px] font-semibold">{l.day_name ?? `Day ${l.day}`}</div>
                  <div className="text-[13px] text-muted">{fmtDate(l.finished_at!)} · Week {l.week} · {sets} sets</div>
                </div>
                <ChevronDown size={18} className={cn("text-muted transition-transform", open && "rotate-180")} />
              </button>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="space-y-2 border-t border-line px-4 py-3">
                      {l.entries.map((e) => (
                        <div key={e.slot} className="flex justify-between gap-3 text-[14px]">
                          <span className="text-fg/85">{e.name}</span>
                          <span className="text-right tabular-nums text-muted">{e.sets.filter((s) => s.done).map((s) => `${s.load ? s.load + "×" : ""}${s.reps}`).join(", ") || "skipped"}</span>
                        </div>
                      ))}
                      <button onClick={() => remove(l.id)} disabled={busy === l.id} className="press mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] text-danger hover:bg-danger/10">
                        <Trash2 size={14} /> Delete workout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
      {hidden > 0 && (
        <LockedPart label={`${hidden} older workout${hidden > 1 ? "s" : ""}: unlock all history with Pro`} target="pro">
          <div className="space-y-2 p-1">{[0, 1].map((i) => <div key={i} className="h-16 rounded-[18px] border border-line bg-card" />)}</div>
        </LockedPart>
      )}
    </div>
  );
}
