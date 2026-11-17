// FitPlanr projection: what the plan the engine just built can do, in numbers a beginner understands.
// Pure and deterministic. Muscle numbers are a conservative range from published beginner estimates
// (roughly 0.5–2 lb of lean mass a month in the first year, less with less training or a calorie deficit).
// Shown as an estimate, never as a promise. Strength numbers come straight from the plan's own targets.

import { e1rm } from "./engine/progression";
import type { Answers, Plan } from "./engine/generate";

export type Projection = {
  /** lean mass in lb at week 12, low and high end of the estimate */
  muscleLo: number;
  muscleHi: number;
  /** middle of the estimate, week 0 → 12 (13 points), for the chart */
  curve: number[];
  lift: {
    name: string;
    /** "25 lb dumbbells" / "bodyweight" */
    startLabel: string;
    startLoad: number | null;
    startReps: number;
    endLoad: number | null;
    endReps: number;
    endSets: number;
    unit: "reps" | "sec";
    /** estimated strength gain on that lift by week 4, in % (0 when it can't be estimated) */
    strengthPct: number;
  } | null;
  workouts: number; // in 4 weeks
  hardSets: number; // in 4 weeks
  minutes: number; // per workout
  weekdays: string[];
  day1: { name: string; minutes: number } | null;
  gearLine: string;
  /** ISO dates: the end of week 4 and of week 12, from `from` */
  week4: string;
  week12: string;
};

const RATE: Record<Answers["level"], [number, number]> = { new: [1, 2], some: [0.75, 1.5], year: [0.5, 1] }; // lb / month
const GOAL: Record<Answers["goal"], number> = { muscle: 1, strength: 0.9, fit: 0.8, fatloss: 0.5 };
const DAYS: Record<Answers["days"], number> = { 2: 0.8, 3: 1, 4: 1.1, 5: 1.1 };

const half = (n: number, up: boolean) => (up ? Math.ceil(n * 2) / 2 : Math.floor(n * 2) / 2);

export function projectPlan(plan: Plan, a: Pick<Answers, "level" | "goal" | "days" | "minutes">, from: Date = new Date()): Projection {
  const f = GOAL[a.goal] * DAYS[a.days];
  const months = 12 / 4.345;
  const [rlo, rhi] = RATE[a.level];
  const muscleLo = Math.max(0.5, half(rlo * f * months, false));
  const muscleHi = Math.max(muscleLo + 0.5, half(rhi * f * months, true));
  const mid = (muscleLo + muscleHi) / 2;
  // gains come a little faster at the very start, then settle
  const curve = Array.from({ length: 13 }, (_, w) => Math.round(mid * Math.pow(w / 12, 0.85) * 10) / 10);

  const w1 = plan.weeks[0];
  const first = w1?.days[0]?.exercises[0];
  let lift: Projection["lift"] = null;
  if (first) {
    // the same slot across the 4 weeks: the best estimated strength reached
    const slots = plan.weeks.map((w) => w.days[0]?.exercises.find((e) => e.slot === first.slot)).filter(Boolean) as typeof first[];
    const score = (e: typeof first) => (e.load ? e1rm(e.load, e.target) : e.target);
    const best = slots.reduce((b, e) => (score(e) >= score(b) ? e : b), first);
    const base = score(first);
    lift = {
      name: first.name,
      startLabel: first.loadLabel,
      startLoad: first.load,
      startReps: first.target,
      endLoad: best.load,
      endReps: best.target,
      endSets: best.sets,
      unit: first.unit,
      strengthPct: base > 0 ? Math.max(0, Math.round(((score(best) - base) / base) * 100)) : 0,
    };
  }

  const hardSets = plan.weeks.reduce((n, w) => n + w.days.reduce((m, d) => m + d.exercises.reduce((s, e) => s + e.sets, 0), 0), 0);
  const at = (days: number) => new Date(from.getTime() + days * 86_400_000).toISOString().slice(0, 10);

  return {
    muscleLo,
    muscleHi,
    curve,
    lift,
    workouts: plan.weeks.reduce((n, w) => n + w.days.length, 0),
    hardSets,
    minutes: a.minutes,
    weekdays: (w1?.days ?? []).map((d) => d.weekday),
    day1: w1?.days[0] ? { name: w1.days[0].name, minutes: w1.days[0].minutes } : null,
    gearLine: plan.gearLine,
    week4: at(28),
    week12: at(84),
  };
}

/** "Feb 9" */
export function shortDate(iso: string) {
  const d = new Date(iso + "T12:00:00Z");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

export function fmtLb(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

/** "Goblet Squat: 25 lb × 8 → 30 lb × 8" */
export function liftLine(l: NonNullable<Projection["lift"]>) {
  const u = l.unit === "sec" ? " s" : "";
  const side = (load: number | null, reps: number) => (load ? `${load} lb × ${reps}${u}` : `${reps}${u || " reps"}`);
  return `${side(l.startLoad, l.startReps)} → ${side(l.endLoad, l.endReps)}`;
}
