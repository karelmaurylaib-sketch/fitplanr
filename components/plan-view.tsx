"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Clock, Lock, Timer } from "lucide-react";
import { useState } from "react";
import type { Plan, PlannedExercise } from "@/lib/engine/generate";
import { EXERCISE_BY_ID } from "@/lib/engine/exercises";
import { FormAnim } from "@/components/form-anim";
import { ExerciseSheet } from "@/components/exercise-sheet";
import { cn } from "@/lib/utils";

export function setsLine(e: PlannedExercise) {
  return `${e.sets} × ${e.target}${e.unit === "sec" ? " s" : ""}`;
}

function ExerciseRow({ e, locked, onOpen }: { e: PlannedExercise; locked: boolean; onOpen: () => void }) {
  const ex = EXERCISE_BY_ID[e.exId];
  return (
    <button onClick={onOpen} disabled={locked} className={cn("press flex w-full items-center gap-3.5 rounded-2xl px-2 py-2.5 text-left", !locked && "hover:bg-white/[0.04]")}>
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-line bg-black/30">
        {ex ? <FormAnim anim={ex.anim} className="h-12 w-12" period={3200} /> : <span className="h-8 w-8 rounded-lg bg-white/10" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[16px] font-semibold">{e.name}</span>
        <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[13px] text-muted">
          <span className="font-semibold text-fg/90">{setsLine(e)}</span>
          {e.loadLabel && <span>· {e.loadLabel}</span>}
          {e.tempo && <span>· tempo {e.tempo}</span>}
        </span>
        {e.note && <span className="mt-1 block text-[12px] text-lime">{e.note}</span>}
      </span>
      <span className="flex shrink-0 items-center gap-1 text-[12px] text-muted">
        <Timer size={13} /> {e.rest}s
      </span>
    </button>
  );
}

export function PlanView({ plan, locked, onLocked, initialWeek = 1 }: { plan: Plan; locked: boolean; onLocked?: () => void; initialWeek?: number }) {
  const [week, setWeek] = useState(initialWeek);
  const [open, setOpen] = useState<PlannedExercise | null>(null);
  const w = plan.weeks[week - 1];

  return (
    <div>
      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5" role="tablist" aria-label="Weeks">
        {plan.weeks.map((x) => {
          const isLocked = locked && x.week > 1;
          return (
            <button
              key={x.week}
              role="tab"
              aria-selected={week === x.week}
              onClick={() => (isLocked ? onLocked?.() : setWeek(x.week))}
              className={cn(
                "press flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 font-mono text-[12px] uppercase tracking-[0.12em]",
                week === x.week ? "border-lime bg-lime text-lime-ink" : "border-line-2 text-fg/80 hover:bg-white/[0.05]",
              )}
            >
              {isLocked && <Lock size={12} />} Week {x.week}
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="font-display text-[22px] font-bold uppercase">{w.focus}</span>
        <span className="text-[14px] text-muted">{w.detail}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={week} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="mt-5 space-y-4">
          {w.days.map((d) => {
            const dayLocked = locked && !(week === 1 && d.day === 1);
            return (
              <section key={d.day} className={cn("relative overflow-hidden rounded-[22px] border bg-card", dayLocked ? "border-line" : "border-line-2")}>
                <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3.5 sm:px-5">
                  <div>
                    <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-lime">
                      Day {d.day} · {d.weekday}
                    </div>
                    <div className="font-display text-[22px] font-bold uppercase leading-tight">{d.name}</div>
                  </div>
                  <span className="flex items-center gap-1.5 rounded-full bg-white/[0.05] px-3 py-1.5 text-[13px] text-fg/80">
                    <Clock size={13} /> {d.minutes} min
                  </span>
                </header>
                <div className={cn("p-2 sm:p-3", dayLocked && "pointer-events-none select-none blur-[7px]")} aria-hidden={dayLocked}>
                  {d.exercises.map((e) => (
                    <ExerciseRow key={e.slot} e={e} locked={dayLocked} onOpen={() => setOpen(e)} />
                  ))}
                </div>
                {dayLocked && (
                  <button onClick={onLocked} className="absolute inset-x-0 bottom-0 top-[64px] flex flex-col items-center justify-center gap-2 bg-gradient-to-b from-card/30 via-card/70 to-card/90 text-center">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10"><Lock size={18} /></span>
                    <span className="text-[15px] font-semibold">Unlock my full plan</span>
                    <span className="text-[13px] text-muted">{d.exercises.length} exercises ready for you</span>
                  </button>
                )}
              </section>
            );
          })}
        </motion.div>
      </AnimatePresence>
      <ExerciseSheet exercise={open} onClose={() => setOpen(null)} />
    </div>
  );
}
