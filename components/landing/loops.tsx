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
    <div ref={ref} className={cn("grid gap-2", compact ? "grid-cols-1" : "grid-cols-2")}>
      {GEAR.slice(0, compact ? 7 : 8).map((g, k) => {
        const active = on.includes(k);
        return (
          <div
            key={g}
            className={cn(
              "flex items-center gap-2 rounded-xl border px-3 transition-all duration-300",
              compact ? "h-10 text-[13px]" : "h-11 text-[13px]",
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

export function LogLoop({ stacked }: { stacked?: boolean }) {
  const { ref, i } = useLoop(5, 1000);
  return (
    <div ref={ref} className={cn("flex items-center gap-4", stacked && "flex-col items-stretch")}>
      <div className={cn(stacked && "flex items-center gap-3")}>
        <Ring value={Math.min(i, 4) / 4} size={stacked ? 64 : 86} stroke={7}>
          <span className={cn("font-display font-bold tabular-nums", stacked ? "text-lg" : "text-2xl")}>{Math.min(i, 4)}/4</span>
        </Ring>
        {stacked && (
          <div>
            <div className="text-[13px] font-semibold">Goblet Squat</div>
            <div className="text-[11px] text-muted">Rest 90 s between sets</div>
          </div>
        )}
      </div>
      <div className="flex-1 space-y-1.5">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className={cn("flex h-9 items-center justify-between rounded-lg border px-3 text-[13px] transition-all duration-300", s <= i ? "border-lime/50 bg-lime/10" : "border-line bg-white/[0.02]")}>
            <span className="whitespace-nowrap text-muted">Set {s}</span>
            <span className="whitespace-nowrap font-semibold tabular-nums">25 lb × 10</span>
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
          <span key={w} className={cn("whitespace-nowrap rounded-full px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em]", w === 1 ? "bg-lime text-lime-ink" : "bg-white/[0.06] text-muted")}>
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
      {["Day 2 · Full Body B", "Day 3 · Full Body C"].map((d) => (
        <div key={d} className="relative overflow-hidden rounded-xl border border-line p-3">
          <div className="text-[11px] font-semibold text-fg/70">{d}</div>
          <div className="mt-1.5 space-y-1.5 blur-[3px]">
            <div className="h-2 w-5/6 rounded bg-white/15" />
            <div className="h-2 w-2/3 rounded bg-white/10" />
          </div>
          <Lock size={12} className="absolute right-3 top-3 text-muted" />
        </div>
      ))}
      <div className="relative hidden overflow-hidden rounded-xl border border-line p-3">
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


/** Rest timer counting down after a set, while the muscles of the last session fill back up to "ready". */
export function RecoveryLoop() {
  const { ref, i } = useLoop(15, 700);
  const left = Math.max(0, 90 - i * 9);
  const muscles = [
    { g: "Chest", from: 0.55 },
    { g: "Back", from: 0.62 },
    { g: "Quads", from: 0.38 },
    { g: "Glutes", from: 0.45 },
    { g: "Shoulders", from: 0.7 },
    { g: "Arms", from: 0.8 },
  ];
  const t = Math.min(1, i / 11);
  return (
    <div ref={ref} className="grid gap-4 sm:grid-cols-[1fr_1.25fr] sm:items-center">
      <div className={cn("flex items-center gap-3 rounded-[20px] border p-3 transition-colors duration-300", left === 0 ? "border-lime bg-lime text-lime-ink" : "border-line-2 bg-[rgb(18_20_14/0.96)]")}>
        {left === 0 ? (
          <span className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-full bg-lime-ink text-lime"><Check size={26} strokeWidth={3} /></span>
        ) : (
          <Ring value={left / 90} size={58} stroke={6}>
            <span className="font-display text-[17px] font-bold tabular-nums">{Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}</span>
          </Ring>
        )}
        <div className="min-w-0">
          <div className="text-[15px] font-semibold">{left === 0 ? "Rest done. Go!" : "Rest"}</div>
          <div className={cn("text-[12px]", left === 0 ? "text-lime-ink/75" : "text-muted")}>Up next: Set 3 · 25 lb × 10</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {muscles.map((m) => {
          const r = Math.min(1, m.from + (1 - m.from) * t);
          const ready = r >= 0.999;
          return (
            <div key={m.g} className="flex flex-col items-center rounded-2xl border border-line bg-white/[0.02] py-2.5">
              <Ring value={r} size={44} stroke={4} color={ready ? "var(--lime)" : r >= 0.7 ? "rgb(200 255 61 / 0.55)" : "#8a8f82"}>
                <span className="font-display text-[13px] font-bold tabular-nums">{Math.round(r * 100)}</span>
              </Ring>
              <div className="mt-1.5 text-[12px] font-semibold">{m.g}</div>
              <div className={cn("text-[10px]", ready ? "text-lime" : "text-muted")}>{ready ? "Ready" : r >= 0.7 ? "Almost" : "Recovering"}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
