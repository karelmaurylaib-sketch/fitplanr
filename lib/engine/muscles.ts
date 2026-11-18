// Muscle map: which muscles a plan day / week trains, from each exercise's movement pattern.
// A primary muscle gets the full set, a helper muscle half a set (the usual "fractional sets" counting).

import type { Pattern } from "./exercises";
import type { PlannedDay } from "./generate";

export type Muscle = "chest" | "shoulders" | "biceps" | "triceps" | "abs" | "quads" | "traps" | "lats" | "lowerback" | "glutes" | "hamstrings" | "calves";

export const MUSCLE_NAME: Record<Muscle, string> = {
  chest: "Chest",
  shoulders: "Shoulders",
  biceps: "Biceps",
  triceps: "Triceps",
  abs: "Abs & core",
  quads: "Quads",
  traps: "Upper back",
  lats: "Lats",
  lowerback: "Lower back",
  glutes: "Glutes",
  hamstrings: "Hamstrings",
  calves: "Calves",
};

export const MUSCLES = Object.keys(MUSCLE_NAME) as Muscle[];

const WORK: Record<Pattern, Partial<Record<Muscle, number>>> = {
  squat: { quads: 1, glutes: 0.5, abs: 0.25 },
  hinge: { hamstrings: 1, glutes: 0.5, lowerback: 0.5 },
  lunge: { quads: 1, glutes: 1, hamstrings: 0.25 },
  hpush: { chest: 1, triceps: 0.5, shoulders: 0.5 },
  vpush: { shoulders: 1, triceps: 0.5, traps: 0.25 },
  hpull: { lats: 1, traps: 0.5, biceps: 0.5, shoulders: 0.25 },
  vpull: { lats: 1, biceps: 0.5 },
  biceps: { biceps: 1 },
  triceps: { triceps: 1 },
  delts: { shoulders: 1 },
  core: { abs: 1 },
  calves: { calves: 1 },
  glutes: { glutes: 1, hamstrings: 0.25 },
};

export type MuscleLoad = Record<Muscle, { sets: number; moves: string[] }>;

export function muscleLoad(days: PlannedDay[], patternOf: (exId: string) => Pattern | undefined): MuscleLoad {
  const out = Object.fromEntries(MUSCLES.map((m) => [m, { sets: 0, moves: [] as string[] }])) as MuscleLoad;
  for (const d of days)
    for (const e of d.exercises) {
      const p = patternOf(e.exId);
      if (!p) continue;
      for (const [m, k] of Object.entries(WORK[p]) as [Muscle, number][]) {
        out[m].sets += e.sets * k;
        if (k >= 0.5 && !out[m].moves.includes(e.name)) out[m].moves.push(e.name);
      }
    }
  for (const m of MUSCLES) out[m].sets = Math.round(out[m].sets * 2) / 2;
  return out;
}

/** 0–3 heat level used by the map: 0 not trained, 1 a little, 2 solid, 3 a lot (for the scope shown). */
export function heat(sets: number, scope: "day" | "week"): 0 | 1 | 2 | 3 {
  const [a, b, c] = scope === "week" ? [0.5, 4, 8] : [0.5, 2, 4];
  if (sets < a) return 0;
  if (sets < b) return 1;
  if (sets < c) return 2;
  return 3;
}
