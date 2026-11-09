// Muscle recovery + smart rest. Deterministic, from the exercise DB and the user's logged sets (no AI).
// Rule of thumb used by coaches for beginners: big muscles need ~48 h between hard sessions, small ones ~36 h,
// a bit more after a high-volume day or when you are new to lifting.

import { EXERCISE_BY_ID } from "./engine/exercises";
import type { Level, PlannedDay, PlannedExercise } from "./engine/generate";

/** ring / dot colour per status (lime = ready) */
export const READY_COLOR = { ready: "var(--lime)", almost: "rgb(200 255 61 / 0.55)", recovering: "#8a8f82" } as const;

export type MuscleGroup = "Chest" | "Back" | "Shoulders" | "Arms" | "Quads" | "Glutes" | "Hamstrings" | "Core" | "Calves";
export const GROUPS: MuscleGroup[] = ["Chest", "Back", "Shoulders", "Arms", "Quads", "Glutes", "Hamstrings", "Core", "Calves"];

const MAP: Record<string, MuscleGroup> = {
  Chest: "Chest",
  Back: "Back",
  "Upper back": "Back",
  Shoulders: "Shoulders",
  "Side delts": "Shoulders",
  "Rear delts": "Shoulders",
  Biceps: "Arms",
  Triceps: "Arms",
  Forearms: "Arms",
  Quads: "Quads",
  Glutes: "Glutes",
  Hamstrings: "Hamstrings",
  Core: "Core",
  Calves: "Calves",
};

/** hours a muscle group needs after a normal session (about 6 hard sets) */
export const BASE_HOURS: Record<MuscleGroup, number> = { Chest: 48, Back: 48, Quads: 48, Glutes: 48, Hamstrings: 48, Shoulders: 36, Arms: 36, Core: 24, Calves: 24 };

/** muscle groups an exercise trains: first listed = main (1 set), the others count half */
export function groupsOf(exId: string): { group: MuscleGroup; weight: number }[] {
  const ex = EXERCISE_BY_ID[exId];
  if (!ex) return [];
  const out = new Map<MuscleGroup, number>();
  ex.muscles.forEach((m, i) => {
    const g = MAP[m];
    if (g) out.set(g, Math.max(out.get(g) ?? 0, i === 0 ? 1 : 0.5));
  });
  return [...out].map(([group, weight]) => ({ group, weight }));
}

/** the main muscle groups of a planned day, biggest share first */
export function dayGroups(day: PlannedDay): MuscleGroup[] {
  const sets = new Map<MuscleGroup, number>();
  for (const e of day.exercises) for (const g of groupsOf(e.exId)) sets.set(g.group, (sets.get(g.group) ?? 0) + g.weight * e.sets);
  return [...sets].filter(([, s]) => s >= 2).sort((a, b) => b[1] - a[1]).map(([g]) => g);
}

export type RecoverySession = { at: string; entries: { exId: string; sets: { reps: number; done: boolean }[] }[] };

export type MuscleRecovery = {
  group: MuscleGroup;
  /** 0..1, 1 = fully recovered */
  readiness: number;
  status: "ready" | "almost" | "recovering";
  lastTrained: string | null;
  readyAt: string | null;
  /** hard sets in the session that set the clock */
  sets: number;
  hoursNeeded: number;
};

function hoursNeeded(group: MuscleGroup, sets: number, level: Level) {
  // 6 sets = the base; each set above adds ~4%, fewer sets recover a bit faster (never under 75%)
  const vol = Math.min(1.35, Math.max(0.75, 0.76 + sets * 0.04));
  const lvl = level === "new" ? 1.1 : level === "some" ? 1 : 0.95;
  return Math.round(BASE_HOURS[group] * vol * lvl);
}

export function statusOf(r: number): MuscleRecovery["status"] {
  return r >= 0.999 ? "ready" : r >= 0.7 ? "almost" : "recovering";
}

/** Recovery per muscle group, from finished workouts (any order). */
export function recoveryMap(sessions: RecoverySession[], level: Level = "new", now = new Date()): MuscleRecovery[] {
  const out = new Map<MuscleGroup, MuscleRecovery>();
  for (const g of GROUPS) out.set(g, { group: g, readiness: 1, status: "ready", lastTrained: null, readyAt: null, sets: 0, hoursNeeded: BASE_HOURS[g] });
  const recent = sessions.filter((s) => now.getTime() - new Date(s.at).getTime() < 7 * 86400000);
  for (const s of recent) {
    const sets = new Map<MuscleGroup, number>();
    for (const en of s.entries) {
      const done = en.sets.filter((x) => x.done && x.reps > 0).length;
      if (!done) continue;
      for (const g of groupsOf(en.exId)) sets.set(g.group, (sets.get(g.group) ?? 0) + g.weight * done);
    }
    for (const [group, n] of sets) {
      if (n < 1) continue;
      const need = hoursNeeded(group, n, level);
      const since = Math.max(0, (now.getTime() - new Date(s.at).getTime()) / 3600000);
      const readiness = Math.min(1, since / need);
      const cur = out.get(group)!;
      const later = !cur.lastTrained || new Date(s.at) > new Date(cur.lastTrained);
      // the session that leaves the muscle least recovered sets the clock
      if (readiness < cur.readiness || (readiness === cur.readiness && later)) {
        out.set(group, {
          group,
          readiness,
          status: statusOf(readiness),
          lastTrained: later ? s.at : cur.lastTrained ?? s.at,
          readyAt: readiness < 1 ? new Date(new Date(s.at).getTime() + need * 3600000).toISOString() : null,
          sets: Math.round(n),
          hoursNeeded: need,
        });
      } else if (later) out.set(group, { ...cur, lastTrained: s.at });
    }
  }
  return GROUPS.map((g) => out.get(g)!);
}

/** How ready the body is for one planned day: the average of its main muscles, and when the last of them is ready. */
export function sessionReadiness(day: PlannedDay, map: MuscleRecovery[]) {
  const groups = dayGroups(day);
  const rows = groups.map((g) => map.find((m) => m.group === g)!).filter(Boolean);
  const value = rows.length ? rows.reduce((n, r) => n + r.readiness, 0) / rows.length : 1;
  const waiting = rows.filter((r) => r.readiness < 0.999);
  const readyAt = waiting.length ? waiting.map((r) => r.readyAt!).sort().at(-1)! : null;
  return { value, groups: rows, waiting, readyAt, status: statusOf(value) };
}

export function untilText(iso: string | null, now = new Date()): string {
  if (!iso) return "now";
  const h = (new Date(iso).getTime() - now.getTime()) / 3600000;
  if (h <= 0) return "now";
  if (h < 1) return `in ${Math.max(1, Math.round(h * 60))} min`;
  if (h < 20) return `in ${Math.round(h)}h`;
  const d = Math.floor(h / 24);
  const rest = Math.floor(h - d * 24);
  if (d === 0) return `in ${Math.round(h)}h`;
  return rest >= 1 ? `in ${d}d ${rest}h` : `in ${d}d`;
}

// ---------- smart rest ----------

export type RestCall = { seconds: number; reason: string };

/** Rest before the next set. Big lifts rest longer; a missed rep target earns 30 s more; the last set of a move hands over to the next one. */
export function restFor(e: PlannedExercise, set: { reps: number }, opts: { lastSet: boolean; next?: PlannedExercise | null }): RestCall {
  const ex = EXERCISE_BY_ID[e.exId];
  const big = !!ex?.compound && ex.load !== "bw" && ex.load !== "band";
  let seconds = e.rest;
  let reason = big ? "Big lift: full rest keeps the next set as strong as this one." : "Smaller muscle: a short rest is enough.";
  const lastSet = opts.lastSet;
  if (e.unit === "reps" && set.reps < e.range[0]) {
    seconds += 30;
    reason = "Under your rep target: 30 s more so you can hit it next set.";
  } else if (e.unit === "reps" && set.reps >= e.range[1] && !lastSet) {
    reason = "Top of the range. Same rest, then go again.";
  }
  if (lastSet) {
    if (!opts.next) return { seconds: 0, reason: "" };
    const nextBig = EXERCISE_BY_ID[opts.next.exId]?.compound;
    seconds = Math.max(60, Math.min(seconds, opts.next.rest) + (nextBig ? 15 : 0));
    reason = `Set up for ${opts.next.name}.`;
  }
  return { seconds: Math.round(seconds / 5) * 5, reason };
}
