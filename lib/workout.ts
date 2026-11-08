import type { Answers, Plan, PlannedDay } from "./engine/generate";
import { loadStep } from "./engine/generate";
import { nextTarget, type LoggedSession, type Target } from "./engine/progression";

export type LogEntry = { slot: string; exId: string; name: string; sets: { reps: number; load: number | null; done: boolean }[] };
export type LogRow = { id: string; plan_id: string | null; week: number; day: number; day_name: string | null; entries: LogEntry[]; started_at: string; finished_at: string | null; created_at: string };

/** The next session in the plan, from how many workouts were finished on it. */
export function nextSession(plan: Plan, finishedOnPlan: number): { week: number; day: number } {
  const perWeek = plan.weeks[0].days.length;
  const total = perWeek * 4;
  const n = Math.min(finishedOnPlan, total - 1);
  return { week: Math.floor(n / perWeek) + 1, day: (n % perWeek) + 1 };
}

export function dayOf(plan: Plan, week: number, day: number): PlannedDay | null {
  return plan.weeks[week - 1]?.days[day - 1] ?? null;
}

/** Smart Progression targets for one day, from the user's logs of the same exercises (newest first). */
export function smartTargets(day: PlannedDay, logs: LogRow[], answers: Answers): Record<string, Target> {
  const out: Record<string, Target> = {};
  for (const e of day.exercises) {
    const history: LoggedSession[] = [];
    for (const l of logs) {
      const en = l.entries.find((x) => x.exId === e.exId);
      if (en) history.push({ at: l.finished_at ?? l.created_at, sets: en.sets });
    }
    const max = answers.gear.includes("adjustable") || answers.gear.includes("dumbbells") ? answers.dbMax || undefined : undefined;
    const isDb = e.loadLabel.includes("dumbbell");
    out[e.slot] = nextTarget(e, history, loadStep(e.exId, answers), isDb ? max : undefined);
  }
  return out;
}
