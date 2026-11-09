"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BatteryCharging, Moon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Ring } from "@/components/ui/motion";
import { READY_COLOR, type MuscleRecovery } from "@/lib/recovery";
import { cn } from "@/lib/utils";


/** Reports a feature once per browser session (Kwop feature_used). */
export function reportFeature(detail: string) {
  try {
    const k = `fp_feat_${detail}`;
    if (sessionStorage.getItem(k)) return;
    sessionStorage.setItem(k, "1");
  } catch {}
  fetch("/api/event", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "feature_used", detail }) }).catch(() => {});
}

export function useFeatureOnce(detail: string) {
  useEffect(() => reportFeature(detail), [detail]);
}

function readyLine(m: MuscleRecovery & { until: string }) {
  if (m.status === "ready") return m.lastTrained ? "Ready" : "Fresh";
  return `Ready ${m.until}`;
}

/** One ring per muscle group. Highlighted = trained in the next session. */
export function RecoveryBoard({ muscles, highlight = [], compact }: { muscles: (MuscleRecovery & { until: string })[]; highlight?: string[]; compact?: boolean }) {
  useFeatureOnce("recovery_tracker");
  const reduce = useReducedMotion();
  return (
    <div className={cn("grid gap-2", compact ? "grid-cols-3" : "grid-cols-3 sm:grid-cols-5 lg:grid-cols-9")}>
      {muscles.map((m, i) => {
        const on = highlight.includes(m.group);
        return (
          <motion.div
            key={m.group}
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 0.8, 0.24, 1], delay: i * 0.06 }}
            className={cn("flex flex-col items-center rounded-2xl border px-1 py-3 text-center", on ? "border-lime/40 bg-lime/[0.05]" : "border-line bg-white/[0.02]")}
            aria-label={`${m.group}: ${Math.round(m.readiness * 100)}% recovered, ${readyLine(m)}`}
          >
            <Ring value={m.readiness} size={52} stroke={5} color={READY_COLOR[m.status]}>
              <span className="font-display text-[15px] font-bold tabular-nums">{Math.round(m.readiness * 100)}</span>
            </Ring>
            <div className="mt-2 text-[13px] font-semibold">{m.group}</div>
            <div className={cn("text-[11px] leading-tight", m.status === "ready" ? "text-lime" : "text-muted")}>
              {m.status === "ready" ? readyLine(m) : (
                <>
                  <span className="block">Ready</span>
                  <span className="block whitespace-nowrap">{m.until}</span>
                </>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/** The training week at a glance: which days you lift, which days your muscles rebuild. */
export function WeekRhythm({ days, doneToday }: { days: { weekday: string; name: string }[]; doneToday?: boolean }) {
  const order = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  // "today" is the visitor's own day: set after mount so the server render never disagrees
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => setToday(order[(new Date().getDay() + 6) % 7]), []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
      {order.map((wd) => {
        const d = days.find((x) => x.weekday === wd);
        const isToday = wd === today;
        return (
          <div
            key={wd}
            className={cn(
              "flex min-w-[92px] flex-1 flex-col rounded-2xl border px-2.5 py-2.5",
              d ? "border-line-2 bg-white/[0.04]" : "border-dashed border-line bg-transparent",
              isToday && "ring-1 ring-lime/70",
            )}
          >
            <div className={cn("font-mono text-[10px] uppercase tracking-[0.16em]", isToday ? "text-lime" : "text-muted")}>{isToday ? "Today" : wd}</div>
            {d ? (
              <div className="mt-1 text-[13px] font-semibold leading-tight">{d.name}</div>
            ) : (
              <div className="mt-1 flex items-center gap-1 text-[13px] text-muted">
                <Moon size={12} /> Rest
              </div>
            )}
            <div className="text-[11px] text-dim">{d ? (isToday && doneToday ? "Done" : "Train") : "Muscles rebuild"}</div>
          </div>
        );
      })}
    </div>
  );
}

/** Before a workout: are the muscles of this session ready? Suggests a better day when they are not. */
export function RecoveryCheck({
  value,
  status,
  groups,
  readyIn,
  alternative,
}: {
  value: number;
  status: "ready" | "almost" | "recovering";
  groups: (MuscleRecovery & { until: string })[];
  readyIn: string;
  alternative: { href: string; name: string } | null;
}) {
  useFeatureOnce("recovery_tracker");
  const waiting = groups.filter((g) => g.status !== "ready");
  const names = (xs: { group: string }[]) => xs.map((x) => x.group).join(", ").replace(/, ([^,]*)$/, " and $1");
  const title = status === "ready" ? "Fully recovered" : status === "almost" ? "Almost recovered" : "Still recovering";
  const line =
    status === "ready"
      ? groups.length
        ? `${names(groups)} ${groups.length > 1 ? "are" : "is"} rested. Train hard today.`
        : "Every muscle is rested. Train hard today."
      : status === "almost"
        ? `Close to ready (fully ${readyIn}). You can train: keep 2–3 reps in the tank.`
        : `${waiting.length > 2 ? "Most of today's muscles" : names(waiting)} still need rest: fully ready ${readyIn}. Best: rest today${alternative ? ", or train another day" : ""}.`;
  return (
    <section className="mb-5 rounded-[22px] border border-line bg-card p-4" aria-label="Recovery check">
      <div className="flex items-center gap-4">
        <Ring value={value} size={64} stroke={6} color={READY_COLOR[status]}>
          <span className="font-display text-[18px] font-bold tabular-nums">{Math.round(value * 100)}%</span>
        </Ring>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
            <BatteryCharging size={13} className={status === "ready" ? "text-lime" : "text-muted"} /> Recovery check
          </div>
          <div className="mt-0.5 text-[16px] font-semibold">{title}</div>
          <p className="text-[13px] leading-snug text-muted">{line}</p>
        </div>
      </div>
      {waiting.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {Object.values(
            waiting.reduce<Record<string, { until: string; readiness: number; status: MuscleRecovery["status"]; names: string[] }>>((acc, g) => {
              const k = g.until;
              acc[k] ??= { until: g.until, readiness: g.readiness, status: g.status, names: [] };
              acc[k].names.push(g.group);
              acc[k].readiness = Math.min(acc[k].readiness, g.readiness);
              return acc;
            }, {}),
          ).map((x) => (
            <span key={x.until} className="flex items-center gap-2 rounded-2xl border border-line bg-white/[0.03] px-3 py-1.5 text-[12px]">
              <span className="relative h-1.5 w-8 shrink-0 overflow-hidden rounded-full bg-white/10">
                <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${Math.max(6, Math.round(x.readiness * 100))}%`, background: READY_COLOR[x.status] }} />
              </span>
              <span>{x.names.join(" · ")}</span>
              <span className="whitespace-nowrap text-muted">{x.until}</span>
            </span>
          ))}
        </div>
      )}
      {status === "recovering" && alternative && (
        <Link href={alternative.href} className="press mt-3 flex h-11 items-center justify-center rounded-full border border-line-2 text-[14px] font-semibold hover:bg-white/[0.05]">
          Train {alternative.name} instead: those muscles are ready
        </Link>
      )}
    </section>
  );
}
