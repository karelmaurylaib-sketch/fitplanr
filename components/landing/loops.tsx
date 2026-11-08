"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { Check, Lock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FormAnim } from "@/components/form-anim";
import { Ring } from "@/components/ui/motion";
import { cn } from "@/lib/utils";

function useLoop(n: number, ms: number) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const reduce = useReducedMotion();
  const [i, setI] = useState(reduce ? n - 1 : 0);
  useEffect(() => {
    if (!inView || reduce) return;
    const id = setInterval(() => setI((x) => (x + 1) % n), ms);
    return () => clearInterval(id);
  }, [inView, reduce, n, ms]);
  return { ref, i };
}

const GEAR = ["Dumbbells", "Bench", "Pull-up bar", "Bands", "Barbell", "Cables", "Kettlebell", "Machines"];

export function GearLoop({ compact }: { compact?: boolean }) {
  const { ref, i } = useLoop(5, 1100);
  const on = [[0], [0, 1], [0, 1, 3], [0, 1, 3, 2], [0, 1, 3, 2]][i];
  return (
    <div ref={ref} className={cn("grid grid-cols-2 gap-2", compact && "gap-1.5")}>
      {GEAR.slice(0, compact ? 6 : 8).map((g, k) => {
        const active = on.includes(k);
        return (
          <div
            key={g}
            className={cn(
              "flex items-center gap-2 rounded-xl border px-3 transition-all duration-300",
              compact ? "h-9 text-[12px]" : "h-11 text-[13px]",
              active ? "border-lime/60 bg-lime/10 font-semibold text-fg" : "border-line bg-white/[0.02] text-muted",
            )}
          >
            <span className={cn("flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border transition-colors", active ? "border-lime bg-lime text-lime-ink" : "border-white/20")}>
              {active && <Check size={11} strokeWidth={3.5} />}
            </span>
            {g}
          </div>
        );
      })}
    </div>
  );
}

export function ProgressionLoop() {
  const { ref, i } = useLoop(4, 1500);
  const weeks = [
    { w: 1, sets: "3 × 8", lb: 25 },
    { w: 2, sets: "3 × 10", lb: 25 },
    { w: 3, sets: "3 × 12", lb: 25 },
    { w: 4, sets: "3 × 8", lb: 30 },
  ];
  return (
    <div ref={ref} className="space-y-2">
      {weeks.map((x, k) => (
        <div key={x.w} className={cn("flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all duration-500", k <= i ? "border-line-2 bg-white/[0.04] opacity-100" : "border-line opacity-40")}>
          <span className="w-12 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Wk {x.w}</span>
          <span className="font-display text-lg font-bold">{x.sets}</span>
          <div className="relative ml-auto h-2 w-24 overflow-hidden rounded-full bg-white/10">
            <motion.div className="h-full rounded-full bg-lime" animate={{ width: k <= i ? `${(x.lb / 30) * 100}%` : "0%" }} transition={{ duration: 0.6 }} />
          </div>
          <span className={cn("w-14 text-right text-sm font-semibold tabular-nums", x.lb > 25 ? "text-lime" : "text-fg")}>{x.lb} lb</span>
        </div>
      ))}
    </div>
  );
}

export function LogLoop() {
  const { ref, i } = useLoop(5, 1000);
  return (
    <div ref={ref} className="flex items-center gap-4">
      <Ring value={Math.min(i, 4) / 4} size={86} stroke={7}>
        <span className="font-display text-2xl font-bold tabular-nums">{Math.min(i, 4)}/4</span>
      </Ring>
      <div className="flex-1 space-y-1.5">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className={cn("flex h-9 items-center justify-between rounded-lg border px-3 text-[13px] transition-all duration-300", s <= i ? "border-lime/50 bg-lime/10" : "border-line bg-white/[0.02]")}>
            <span className="text-muted">Set {s}</span>
            <span className="font-semibold tabular-nums">25 lb × 10</span>
            <span className={cn("flex h-5 w-5 items-center justify-center rounded-md transition-colors", s <= i ? "bg-lime text-lime-ink" : "border border-white/20")}>{s <= i && <Check size={12} strokeWidth={3.5} />}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FormLoop() {
  return (
    <div className="flex items-center gap-4">
      <div className="aspect-square w-32 shrink-0 rounded-2xl border border-line bg-white/[0.02] p-2">
        <FormAnim anim="squat" className="h-full w-full" />
      </div>
      <ul className="space-y-2 text-[13px] text-muted">
        {["Hold the dumbbell tight to your chest", "Sit down between your heels", "Push the floor away"].map((c, k) => (
          <li key={c} className="flex gap-2">
            <span className="font-mono text-[11px] text-lime">0{k + 1}</span>
            {c}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Mini plan screen for device frames: day 1 in clear, the rest locked. */
export function PlanMini() {
  const reduce = useReducedMotion();
  const rows = ["Goblet Squat · 3 × 8 · 25 lb", "Floor Press · 3 × 8 · 25 lb", "One-Arm Row · 3 × 8 · 25 lb", "Romanian Deadlift · 3 × 8 · 25 lb"];
  return (
    <div className="space-y-2">
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((w) => (
          <span key={w} className={cn("rounded-full px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em]", w === 1 ? "bg-lime text-lime-ink" : "bg-white/[0.06] text-muted")}>
            Wk {w}
          </span>
        ))}
      </div>
      <div className="rounded-xl border border-line-2 bg-white/[0.04] p-3">
        <div className="font-display text-base font-bold uppercase">Day 1 · Full Body A</div>
        {rows.map((r, k) => (
          <motion.div key={r} initial={reduce ? false : { opacity: 0, x: -6 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + k * 0.12 }} viewport={{ once: true }} className="mt-1.5 text-[11px] text-fg/80">
            {r}
          </motion.div>
        ))}
      </div>
      <div className="relative overflow-hidden rounded-xl border border-line p-3">
        <div className="space-y-1.5 blur-[3px]">
          <div className="h-2.5 w-2/3 rounded bg-white/20" />
          <div className="h-2 w-5/6 rounded bg-white/10" />
          <div className="h-2 w-3/4 rounded bg-white/10" />
        </div>
        <span className="absolute inset-0 flex items-center justify-center gap-1.5 text-[11px] font-semibold">
          <Lock size={12} /> Days 2–12
        </span>
      </div>
    </div>
  );
}
