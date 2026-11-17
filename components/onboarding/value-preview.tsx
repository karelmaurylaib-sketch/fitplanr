"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Clock, Dumbbell, Layers, RotateCw, TrendingUp } from "lucide-react";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Sheet } from "@/components/ui/sheet";
import { MainButton } from "@/components/ui/button";
import { CountUp } from "@/components/ui/motion";
import { fmtLb, liftLine, shortDate, type Projection } from "@/lib/projection";
import { LoadBar, ProjectionChart } from "./projection-chart";

/** A projection card: fades in over 300 ms, 60 ms after the one before. */
export function PCard({ i, children, className = "" }: { i: number; children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 0.8, 0.24, 1], delay: 0.08 + i * 0.06 }}
      className={`rounded-[22px] border border-line bg-card p-5 ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function MuscleCard({ p, i = 0 }: { p: Projection; i?: number }) {
  return (
    <PCard i={i}>
      <div className="flex items-center gap-2 text-[13px] font-medium text-muted">
        <TrendingUp size={15} className="text-lime" /> Estimated muscle gained
      </div>
      <div className="mt-2 flex items-end gap-2">
        <span className="font-display text-[54px] font-bold leading-[0.9] tabular-nums text-lime">
          +{fmtLb(p.muscleLo)}–{fmtLb(p.muscleHi)}
        </span>
        <span className="pb-1 font-display text-[24px] font-bold uppercase">lb</span>
        <span className="ml-auto pb-1.5 text-right text-[13px] leading-tight text-muted">
          by <span className="font-semibold text-fg">{shortDate(p.week12)}</span>
          <br />
          week 12
        </span>
      </div>
      <ProjectionChart className="mt-5" curve={p.curve} lo={p.muscleLo} hi={p.muscleHi} labels={["Today", `Wk 4 · ${shortDate(p.week4)}`, "Wk 12"]} />
    </PCard>
  );
}

export function LiftCard({ p, i = 1 }: { p: Projection; i?: number }) {
  const l = p.lift;
  if (!l) return null;
  const sec = l.unit === "sec";
  const fromLabel = l.startLoad ? `${l.startLoad} × ${l.startReps}` : `${l.startReps}${sec ? " s" : " reps"}`;
  const toLabel = l.endLoad ? `${l.endLoad} × ${l.endReps}` : `${l.endReps}${sec ? " s" : " reps"}`;
  return (
    <PCard i={i}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[13px] font-medium text-muted">
            <Dumbbell size={15} className="text-lime" /> Day 1&apos;s first lift
          </div>
          <div className="mt-1 text-[18px] font-semibold">{l.name}</div>
        </div>
        {l.strengthPct > 0 && (
          <span className="shrink-0 rounded-full bg-lime/[0.12] px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-lime">+{l.strengthPct}% strength</span>
        )}
      </div>
      <div className="mt-4">
        <LoadBar from={l.startLoad ?? l.startReps} to={l.endLoad ?? l.endReps} fromLabel={fromLabel} toLabel={toLabel} />
      </div>
      <p className="mt-3 text-[13px] leading-snug text-muted">
        {liftLine(l)} by week 4 ({shortDate(p.week4)}){l.endSets > 3 ? `, ${l.endSets} sets` : ""}. Your plan adds it for you.
      </p>
    </PCard>
  );
}

export function StatsCard({ p, i = 2 }: { p: Projection; i?: number }) {
  const stats = [
    { icon: RotateCw, n: p.workouts, l: "workouts" },
    { icon: Layers, n: p.hardSets, l: "sets" },
    { icon: Clock, n: p.minutes, l: "min each" },
  ];
  return (
    <PCard i={i} className="grid grid-cols-3 divide-x divide-line !p-0">
      {stats.map((s) => (
        <div key={s.l} className="px-3 py-4 text-center">
          <s.icon size={15} className="mx-auto text-muted" />
          <CountUp to={s.n} className="mt-1 block font-display text-[30px] font-bold leading-none" />
          <span className="text-[12px] text-muted">{s.l}</span>
        </div>
      ))}
    </PCard>
  );
}

export const PROJECTION_NOTE = "Estimate for beginners who follow the plan and eat enough protein. Bodies differ: it's a guide, not a promise.";

export function ValuePreview({ open, onClose, onContinue, busy }: { open: boolean; onClose: () => void; onContinue: () => void; busy?: boolean }) {
  const [p, setP] = useState<Projection | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  const load = useCallback(async () => {
    setState("loading");
    try {
      const r = await fetch("/api/plan/preview", { cache: "no-store" });
      const j = await r.json();
      if (!r.ok || !j.projection) throw new Error(j.error || "preview");
      setP(j.projection);
      setState("ready");
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  return (
    <Sheet open={open} onClose={onClose} label="Your projection" variant="full" width={520}>
      <div className="relative min-h-0 flex-1 overflow-y-auto px-5 pb-32 pt-16 sm:px-7">
        <div className="label">[ Your projection ]</div>
        <h2 className="display mt-3 text-[38px] sm:text-[44px]">
          Here&apos;s where
          <span className="grad-2 block">12 weeks take you.</span>
        </h2>

        {state === "loading" && (
          <div className="mt-6 space-y-3" aria-busy="true" aria-label="Loading your projection">
            <div className="skeleton h-4 w-3/4" />
            <div className="skeleton h-[250px] w-full !rounded-[22px]" />
            <div className="skeleton h-[170px] w-full !rounded-[22px]" />
            <div className="skeleton h-[96px] w-full !rounded-[22px]" />
          </div>
        )}

        {state === "error" && (
          <div className="mt-6 rounded-[22px] border border-line bg-card p-5 text-[15px]">
            <div className="font-semibold">Your projection didn&apos;t load.</div>
            <p className="mt-1 text-muted">Your answers are saved. Try again, or build your plan now.</p>
            <button onClick={load} className="press mt-4 inline-flex h-11 items-center rounded-full border border-line-2 px-5 text-[14px] font-semibold hover:bg-white/[0.06]">
              Try again
            </button>
          </div>
        )}

        {state === "ready" && p && (
          <>
            <p className="mt-3 text-[15px] text-muted">
              From the plan we&apos;re about to build: {p.weekdays.length} days a week on {p.gearLine}.
            </p>
            <div className="mt-6 space-y-3">
              <MuscleCard p={p} i={0} />
              <LiftCard p={p} i={1} />
              <StatsCard p={p} i={2} />
            </div>
            <p className="mt-4 text-[12px] leading-relaxed text-dim">{PROJECTION_NOTE}</p>
          </>
        )}
      </div>
      <div className="safe-bottom absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0b0c09] via-[#0b0c09] to-transparent px-5 pt-8 sm:px-7">
        <MainButton className="w-full" onClick={onContinue} disabled={busy}>
          Build my plan
        </MainButton>
      </div>
    </Sheet>
  );
}
