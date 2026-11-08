// Smart Progression: reads what the user really logged and sets the next target.
// Double progression: reps climb inside the range, then the weight goes up one step.

import type { PlannedExercise } from "./generate";

export type LoggedSet = { reps: number; load: number | null; done: boolean };
export type LoggedSession = { at: string; sets: LoggedSet[] };

export type Target = {
  load: number | null;
  target: number;
  sets: number;
  reason: string;
  change: "up" | "reps" | "hold" | "down" | "plan";
};

export function nextTarget(p: PlannedExercise, history: LoggedSession[], step: number, maxLoad?: number): Target {
  const base: Target = { load: p.load, target: p.target, sets: p.sets, reason: "From your plan", change: "plan" };
  if (p.unit !== "reps") return base;
  const sessions = history.filter((h) => h.sets.some((s) => s.done)).slice(0, 3);
  if (!sessions.length) return base;

  const last = sessions[0];
  const done = last.sets.filter((s) => s.done);
  const lastLoad = done[0]?.load ?? p.load;
  const [lo, hi] = p.range;
  const allTop = done.length >= p.sets && done.every((s) => s.reps >= hi);
  const allHit = done.length >= p.sets && done.every((s) => s.reps >= p.target);
  const missed = (h: LoggedSession) => h.sets.filter((s) => s.done).some((s) => s.reps < lo);

  if (allTop) {
    if (step > 0 && lastLoad !== null && (!maxLoad || lastLoad + step <= maxLoad)) {
      return { load: lastLoad + step, target: lo, sets: p.sets, reason: `You hit ${hi} on every set. +${step} lb.`, change: "up" };
    }
    return { load: lastLoad, target: hi, sets: p.sets + 1, reason: `Top of the range with this weight: one more set.`, change: "reps" };
  }
  if (sessions.length >= 3 && sessions.every(missed) && lastLoad !== null && step > 0) {
    const down = Math.max(5, Math.round((lastLoad * 0.9) / 5) * 5);
    return { load: down, target: lo, sets: p.sets, reason: "Three tough sessions in a row: −10% to rebuild clean reps.", change: "down" };
  }
  if (missed(last)) {
    return { load: lastLoad, target: lo, sets: p.sets, reason: "Missed a few reps last time: same weight, own it.", change: "hold" };
  }
  if (allHit) {
    return { load: lastLoad, target: Math.min(hi, Math.max(p.target, Math.max(...done.map((s) => s.reps)) + 1)), sets: p.sets, reason: "All sets done: one more rep.", change: "reps" };
  }
  return { load: lastLoad, target: p.target, sets: p.sets, reason: "Same as last time: finish every set.", change: "hold" };
}

/** Estimated 1-rep max (Epley), for the strength charts. */
export function e1rm(load: number, reps: number) {
  if (!load || reps <= 0) return 0;
  return Math.round(load * (1 + reps / 30));
}
