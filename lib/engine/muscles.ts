// Muscle map + calorie estimate for every exercise. Deterministic, no AI.
import { EXERCISE_BY_ID, type Exercise, type Pattern } from "./exercises";

export type Region =
  | "chest"
  | "frontDelts"
  | "sideDelts"
  | "rearDelts"
  | "biceps"
  | "triceps"
  | "forearms"
  | "abs"
  | "obliques"
  | "traps"
  | "lats"
  | "upperBack"
  | "lowerBack"
  | "glutes"
  | "quads"
  | "hamstrings"
  | "adductors"
  | "calves";

export const REGION_LABEL: Record<Region, string> = {
  chest: "Chest",
  frontDelts: "Front delts",
  sideDelts: "Side delts",
  rearDelts: "Rear delts",
  biceps: "Biceps",
  triceps: "Triceps",
  forearms: "Forearms",
  abs: "Abs",
  obliques: "Obliques",
  traps: "Traps",
  lats: "Lats",
  upperBack: "Upper back",
  lowerBack: "Lower back",
  glutes: "Glutes",
  quads: "Quads",
  hamstrings: "Hamstrings",
  adductors: "Inner thighs",
  calves: "Calves",
};

/** Which side of the body each region is drawn on. */
export const FRONT: Region[] = ["chest", "frontDelts", "sideDelts", "biceps", "forearms", "abs", "obliques", "traps", "quads", "adductors", "calves"];
export const BACK: Region[] = ["traps", "rearDelts", "sideDelts", "upperBack", "lats", "triceps", "forearms", "lowerBack", "glutes", "hamstrings", "calves"];

// The labels used in the exercise DB → anatomical regions.
const LABEL_REGIONS: Record<string, Region[]> = {
  Quads: ["quads"],
  Glutes: ["glutes"],
  Hamstrings: ["hamstrings"],
  Core: ["abs", "obliques"],
  Back: ["lats", "upperBack"],
  "Upper back": ["upperBack", "traps"],
  Chest: ["chest"],
  Triceps: ["triceps"],
  Shoulders: ["frontDelts", "sideDelts"],
  "Side delts": ["sideDelts"],
  "Rear delts": ["rearDelts"],
  Biceps: ["biceps"],
  Forearms: ["forearms"],
  Calves: ["calves"],
};

// Helpers that also work in each movement pattern (shown as "secondary").
const PATTERN_HELPERS: Record<Pattern, Region[]> = {
  squat: ["adductors", "abs", "lowerBack"],
  hinge: ["lowerBack", "forearms", "adductors"],
  lunge: ["adductors", "hamstrings", "calves"],
  glutes: ["hamstrings"],
  hpush: ["frontDelts"],
  vpush: ["triceps", "traps", "abs"],
  hpull: ["rearDelts", "forearms", "traps"],
  vpull: ["rearDelts", "forearms"],
  biceps: ["forearms"],
  triceps: [],
  delts: ["traps"],
  core: ["obliques", "frontDelts"],
  calves: [],
};

// A few exercises work differently from their pattern.
const OVERRIDES: Record<string, { primary?: Region[]; secondary?: Region[] }> = {
  "bb-back-squat": { secondary: ["hamstrings", "lowerBack", "abs", "adductors"] },
  "db-hip-thrust": { secondary: ["hamstrings", "quads"] },
  "glute-bridge": { secondary: ["hamstrings", "lowerBack"] },
  "pushup": { primary: ["chest"], secondary: ["triceps", "frontDelts", "abs"] },
  "diamond-pushup": { primary: ["triceps"], secondary: ["chest", "frontDelts"] },
  "pike-pushup": { primary: ["frontDelts", "sideDelts"], secondary: ["triceps", "traps"] },
  "db-pullover": { primary: ["lats"], secondary: ["chest", "triceps"] },
  "band-face-pull": { primary: ["rearDelts"], secondary: ["upperBack", "traps"] },
  "bench-dip": { secondary: ["chest", "frontDelts"] },
  "plank": { primary: ["abs"], secondary: ["obliques", "frontDelts", "glutes"] },
  "dead-bug": { primary: ["abs"], secondary: ["obliques"] },
  "hammer-curl": { primary: ["biceps", "forearms"] },
};

export type MuscleSet = { primary: Region[]; secondary: Region[] };

/** Primary = the first muscle the exercise lists (the one it is built for); secondary = the other listed muscles + helpers. */
export function musclesFor(exId: string): MuscleSet {
  const ex = EXERCISE_BY_ID[exId];
  if (!ex) return { primary: [], secondary: [] };
  const o = OVERRIDES[exId] ?? {};
  const listed = ex.muscles.map((m) => LABEL_REGIONS[m] ?? []);
  const primary = o.primary ?? listed[0] ?? [];
  const rest = [...listed.slice(1).flat(), ...(o.secondary ?? PATTERN_HELPERS[ex.pattern])];
  const secondary = [...new Set(rest)].filter((r) => !primary.includes(r));
  return { primary: [...new Set(primary)], secondary };
}

// ---------------- Calories ----------------
// MET values from the Compendium of Physical Activities (resistance training 3.5 light → 6.0 vigorous,
// calisthenics 3.8, plank/core 3.0–3.8). Rest between sets ≈ 1.8 MET (standing, breathing still up).
export function metFor(ex: Exercise): number {
  if (ex.pattern === "calves") return 3.0;
  if (ex.pattern === "core") return 3.8;
  if (["squat", "hinge", "lunge"].includes(ex.pattern)) return ex.load === "bb" ? 6.0 : 5.5;
  if (ex.pattern === "glutes") return 4.5;
  if (ex.compound) return 5.0;
  return 3.5;
}
const REST_MET = 1.8;

export type Sex = "male" | "female";
export type BodyStats = { sex: Sex; weightLb: number; age: number };

export const LIMITS = { weight: [70, 500] as const, age: [13, 90] as const };

/** Resting burn in kcal/day from weight, age and sex (Schofield equations, WHO/FAO). */
export function restingKcalPerDay({ sex, weightLb, age }: BodyStats): number {
  const kg = weightLb * 0.45359237;
  const t =
    sex === "male"
      ? age < 18 ? [17.686, 658.2] : age < 30 ? [15.057, 692.2] : age < 60 ? [11.472, 873.1] : [11.711, 587.7]
      : age < 18 ? [13.384, 692.6] : age < 30 ? [14.818, 486.6] : age < 60 ? [8.126, 845.6] : [9.082, 658.5];
  return t[0] * kg + t[1];
}

export type Volume = { sets: number; target: number; unit: "reps" | "sec"; rest: number };
export const DEFAULT_VOLUME: Volume = { sets: 3, target: 10, unit: "reps", rest: 90 };

export type Burn = { total: number; perMin: number; minutes: number; workMin: number };

/**
 * Corrected-MET estimate: kcal/min = MET × (your resting kcal/day ÷ 1440).
 * Work time = reps × 3 s (2 s down, 1 s up) or the hold time; rest = the planned rest between sets.
 */
export function estimateBurn(exId: string, stats: BodyStats, vol: Volume = DEFAULT_VOLUME): Burn | null {
  const ex = EXERCISE_BY_ID[exId];
  if (!ex || !validStats(stats)) return null;
  const perRestMin = restingKcalPerDay(stats) / 1440;
  const met = metFor(ex);
  const workMin = (vol.sets * (vol.unit === "sec" ? vol.target : vol.target * 3)) / 60;
  const restMin = (Math.max(0, vol.sets - 1) * vol.rest) / 60;
  const total = met * perRestMin * workMin + REST_MET * perRestMin * restMin;
  return { total, perMin: met * perRestMin, minutes: workMin + restMin, workMin };
}

export function validStats(s: Partial<BodyStats> | null | undefined): s is BodyStats {
  return (
    !!s &&
    (s.sex === "male" || s.sex === "female") &&
    typeof s.weightLb === "number" && s.weightLb >= LIMITS.weight[0] && s.weightLb <= LIMITS.weight[1] &&
    typeof s.age === "number" && Number.isInteger(s.age) && s.age >= LIMITS.age[0] && s.age <= LIMITS.age[1]
  );
}
