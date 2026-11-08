// FitPlanr plan engine: a deterministic, rule-based program generator.
// Same answers → same plan. Safe defaults for beginners: conservative starting loads,
// no max testing, joint-friendly swaps, weekly volume capped.

import { EXERCISES, EXERCISE_BY_ID, GEAR_LABELS, hasGear, type Exercise, type Gear, type Joint, type Pattern } from "./exercises";

export type Goal = "muscle" | "strength" | "fatloss" | "fit";
export type Level = "new" | "some" | "year";

export type Answers = {
  goal: Goal;
  level: Level;
  days: 2 | 3 | 4 | 5;
  minutes: 30 | 45 | 60;
  protect: Joint[];
  gear: Gear[];
  dbMax: number; // heaviest dumbbell in lb (0 if none)
};

export type PlanOptions = { deload?: boolean; swaps?: Record<string, string>; dayOrder?: number[] };

export type PlannedExercise = {
  slot: string; // stable id inside the plan: d{day}-{i}
  exId: string;
  name: string;
  sets: number;
  range: [number, number];
  target: number;
  unit: "reps" | "sec";
  load: number | null;
  loadLabel: string;
  rest: number;
  tempo?: string;
  note?: string;
};

export type PlannedDay = { day: number; name: string; weekday: string; focus: string; minutes: number; exercises: PlannedExercise[] };
export type PlannedWeek = { week: number; focus: string; detail: string; days: PlannedDay[] };

export type Plan = {
  version: 1;
  title: string;
  split: string;
  summary: string;
  gearLine: string;
  weeks: PlannedWeek[];
};

const LEVEL_FACTOR: Record<Level, number> = { new: 1, some: 1.5, year: 2 };

const TEMPLATES: Record<string, { name: string; focus: string; patterns: Pattern[] }> = {
  fbA: { name: "Full Body A", focus: "Squat · Push · Pull", patterns: ["squat", "hpush", "hpull", "hinge", "delts", "core", "biceps"] },
  fbB: { name: "Full Body B", focus: "Hinge · Press · Pull-down", patterns: ["hinge", "vpush", "vpull", "lunge", "triceps", "glutes", "calves"] },
  fbC: { name: "Full Body C", focus: "Lunge · Push · Row", patterns: ["lunge", "hpush", "hpull", "glutes", "biceps", "triceps", "core"] },
  upA: { name: "Upper A", focus: "Chest · Back", patterns: ["hpush", "hpull", "vpush", "vpull", "biceps", "triceps"] },
  loA: { name: "Lower A", focus: "Squat focus", patterns: ["squat", "hinge", "lunge", "calves", "core", "glutes"] },
  upB: { name: "Upper B", focus: "Shoulders · Back", patterns: ["vpush", "vpull", "hpush", "hpull", "delts", "triceps"] },
  loB: { name: "Lower B", focus: "Hinge focus", patterns: ["hinge", "squat", "glutes", "lunge", "calves", "core"] },
  push: { name: "Push", focus: "Chest · Shoulders · Triceps", patterns: ["hpush", "vpush", "hpush", "delts", "triceps", "triceps"] },
  pull: { name: "Pull", focus: "Back · Biceps", patterns: ["vpull", "hpull", "hpull", "delts", "biceps", "biceps"] },
  legs: { name: "Legs", focus: "Quads · Glutes · Hamstrings", patterns: ["squat", "hinge", "lunge", "glutes", "calves", "core"] },
};

const SPLITS: Record<number, { name: string; days: string[]; weekdays: string[] }> = {
  2: { name: "Full Body", days: ["fbA", "fbB"], weekdays: ["Mon", "Thu"] },
  3: { name: "Full Body", days: ["fbA", "fbB", "fbC"], weekdays: ["Mon", "Wed", "Fri"] },
  4: { name: "Upper / Lower", days: ["upA", "loA", "upB", "loB"], weekdays: ["Mon", "Tue", "Thu", "Fri"] },
  5: { name: "Push / Pull / Legs + Upper / Lower", days: ["push", "pull", "legs", "upA", "loB"], weekdays: ["Mon", "Tue", "Wed", "Fri", "Sat"] },
};

const EXERCISES_BY_MINUTES: Record<number, number> = { 30: 4, 45: 5, 60: 6 };

function repRange(goal: Goal, ex: Exercise): [number, number] {
  if (ex.pattern === "core" && ex.id === "plank") return [20, 45];
  if (ex.load === "bw" && ex.compound) return goal === "strength" ? [5, 10] : [8, 15];
  if (ex.compound) {
    if (goal === "strength") return [5, 8];
    if (goal === "muscle") return [8, 12];
    return [10, 15];
  }
  if (goal === "strength") return [8, 12];
  return [10, 15];
}

function gearRank(ex: Exercise, level: Level): number {
  // Lower is better. Beginners start on stable, easy-to-learn tools.
  const order: Record<string, number> =
    level === "new"
      ? { db: 0, stack: 1, bb: 2, kb: 3, band: 4, bw: 5 }
      : { bb: 0, db: 1, stack: 2, kb: 3, band: 4, bw: 5 };
  return order[ex.load] ?? 9;
}

function round5(n: number) {
  return Math.max(5, Math.round(n / 5) * 5);
}

type Ctx = { a: Answers; fixedPair: boolean };

function startingLoad(ex: Exercise, ctx: Ctx): number | null {
  const f = LEVEL_FACTOR[ctx.a.level];
  if (ex.load === "db") {
    const want = round5(ex.base * f);
    if (ctx.fixedPair) return ctx.a.dbMax || want;
    return ctx.a.dbMax ? Math.min(want, ctx.a.dbMax) : want;
  }
  if (ex.load === "bb") return Math.max(45, round5(ex.base * f));
  if (ex.load === "stack") return round5(ex.base * f);
  return null;
}

function usable(ex: Exercise, ctx: Ctx): boolean {
  if (!hasGear(ctx.a.gear, ex)) return false;
  if (ex.stresses.some((j) => ctx.a.protect.includes(j))) return false;
  // A fixed pair that is far too heavy for a small exercise is unsafe: skip it.
  if (ex.load === "db" && ctx.fixedPair && ctx.a.dbMax) {
    const want = ex.base * LEVEL_FACTOR[ctx.a.level];
    if (ctx.a.dbMax > want * 2.2) return false;
  }
  if (ex.load === "db" && !ctx.fixedPair && !ctx.a.gear.includes("adjustable") && !ctx.a.gear.includes("dumbbells")) return false;
  return true;
}

function candidates(pattern: Pattern, ctx: Ctx): Exercise[] {
  return EXERCISES.filter((e) => e.pattern === pattern && usable(e, ctx)).sort(
    (x, y) => gearRank(x, ctx.a.level) - gearRank(y, ctx.a.level),
  );
}

function loadLabel(ex: Exercise, load: number | null): string {
  if (ex.load === "db") return `${load} lb dumbbells`;
  if (ex.load === "bb") return `${load} lb bar`;
  if (ex.load === "stack") return `${load} lb`;
  if (ex.load === "kb") return "your kettlebell";
  if (ex.load === "band") return "medium band";
  return "bodyweight";
}

function restFor(ex: Exercise, goal: Goal) {
  let r = ex.compound ? (goal === "strength" ? 150 : 90) : 60;
  if (goal === "fatloss") r -= 15;
  return r;
}

function step(ex: Exercise, ctx: Ctx): number {
  if (ex.load === "db") return ctx.fixedPair ? 0 : 5;
  if (ex.load === "bb") return ex.pattern === "squat" || ex.pattern === "hinge" ? 10 : 5;
  if (ex.load === "stack") return 10;
  return 0;
}

export function loadStep(exId: string, a: Answers): number {
  const ex = EXERCISE_BY_ID[exId];
  return ex ? step(ex, { a, fixedPair: isFixedPair(a) }) : 0;
}

function isFixedPair(a: Answers) {
  return a.gear.includes("dumbbells") && !a.gear.includes("adjustable");
}

export function gearLine(a: Answers): string {
  const g = a.gear;
  if (g.length === 0) return "your bodyweight";
  if (g.length === 1 && g[0] === "dumbbells") return `2 dumbbells (${a.dbMax} lb)`;
  if (g.includes("machines") && g.includes("barbell") && g.includes("cables")) return "a full gym";
  const parts = g.map((x) => (x === "dumbbells" ? `dumbbells (${a.dbMax} lb)` : x === "adjustable" ? `adjustable dumbbells up to ${a.dbMax} lb` : GEAR_LABELS[x].toLowerCase()));
  if (parts.length <= 2) return parts.join(" and ");
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

export function generatePlan(a: Answers, opts: PlanOptions = {}): Plan {
  const ctx: Ctx = { a, fixedPair: isFixedPair(a) };
  const split = SPLITS[a.days];
  const nEx = EXERCISES_BY_MINUTES[a.minutes];
  const compoundSets = a.level === "year" ? 4 : 3;
  const accSets = a.level === "new" ? 2 : 3;

  // Build week-1 days: pick exercises per pattern, rotate variants across days.
  const usedCount: Record<string, number> = {};
  const baseDays = split.days.map((key, di) => {
    const t = TEMPLATES[key];
    const chosen: Exercise[] = [];
    for (const p of t.patterns) {
      if (chosen.length >= nEx) break;
      const list = candidates(p, ctx).filter((e) => !chosen.some((c) => c.id === e.id));
      if (!list.length) continue;
      // prefer the least-used exercise so A and B days differ
      list.sort((x, y) => (usedCount[x.id] ?? 0) - (usedCount[y.id] ?? 0));
      const pick = list[0];
      usedCount[pick.id] = (usedCount[pick.id] ?? 0) + 1;
      chosen.push(pick);
    }
    // safety net: fill with bodyweight core/glutes if gear is very limited
    for (const fill of ["plank", "glute-bridge", "calf-raise", "dead-bug"]) {
      if (chosen.length >= Math.min(nEx, 4)) break;
      const ex = EXERCISE_BY_ID[fill];
      if (!chosen.some((c) => c.id === fill) && usable(ex, ctx)) chosen.push(ex);
    }
    return { key, t, weekday: split.weekdays[di], chosen };
  });

  const order = opts.dayOrder && opts.dayOrder.length === baseDays.length ? opts.dayOrder : baseDays.map((_, i) => i);
  const weekdays = split.weekdays;

  const weeks: PlannedWeek[] = [1, 2, 3, 4].map((w) => {
    const deload = w === 4 && !!opts.deload;
    const focus = w === 1 ? "Learn the moves" : w === 2 ? "Add reps" : w === 3 ? "Top of the range" : deload ? "Deload" : "Heavier";
    const detail =
      w === 1
        ? "Easy start: stop each set with 2–3 reps left in the tank."
        : w === 2
          ? "Same weights, a few more reps."
          : w === 3
            ? "Push to the top of each rep range."
            : deload
              ? "A lighter week so your body catches up and you come back stronger."
              : "Weights go up. Reps reset to the bottom of the range.";

    const days: PlannedDay[] = order.map((bi, pos) => {
      const bd = baseDays[bi];
      const exercises: PlannedExercise[] = bd.chosen.map((orig, i) => {
        const slot = `d${bi + 1}-${i + 1}`;
        const swapped = opts.swaps?.[slot] ? EXERCISE_BY_ID[opts.swaps[slot]] : undefined;
        const ex = swapped && usable(swapped, ctx) ? swapped : orig;
        const range = repRange(a.goal, ex);
        const [lo, hi] = range;
        let sets = ex.compound ? compoundSets : accSets;
        let load = startingLoad(ex, ctx);
        let target = lo;
        let tempo: string | undefined;
        let note: string | undefined;
        const s = step(ex, ctx);
        if (w === 2) target = Math.round((lo + hi) / 2);
        if (w === 3) target = hi;
        if (w === 4) {
          if (deload) {
            sets = Math.max(2, sets - 1);
            target = lo;
            if (load) load = round5(load * 0.9);
          } else if (s > 0 && load !== null && !(ex.load === "db" && a.dbMax && load + s > a.dbMax)) {
            load += s;
            target = lo;
            note = `+${s} lb from week 3`;
          } else {
            sets += 1;
            target = hi;
            tempo = "3-1-1";
            note = "Same weight: one more set, 3 seconds down on every rep";
          }
        }
        if (ex.id === "plank") {
          const sec = w === 1 ? 20 : w === 2 ? 30 : w === 3 ? 40 : deload ? 20 : 45;
          target = sec;
        }
        return {
          slot,
          exId: ex.id,
          name: ex.name,
          sets,
          range,
          target,
          unit: ex.id === "plank" ? "sec" : "reps",
          load,
          loadLabel: loadLabel(ex, load),
          rest: restFor(ex, a.goal),
          tempo,
          note,
        };
      });
      const minutes = Math.min(a.minutes, Math.round(exercises.reduce((m, e) => m + e.sets * (0.75 + e.rest / 60), 0) + 6));
      return { day: pos + 1, name: bd.t.name, weekday: weekdays[pos], focus: bd.t.focus, minutes, exercises };
    });
    return { week: w, focus, detail, days };
  });

  const goalWord = { muscle: "Muscle Builder", strength: "Strength Builder", fatloss: "Lean Builder", fit: "Fit Starter" }[a.goal];
  return {
    version: 1,
    title: `${a.days}-Day ${goalWord}`,
    split: split.name,
    summary: `${a.days} days a week, ${a.minutes} minutes, built on ${gearLine(a)}.`,
    gearLine: gearLine(a),
    weeks,
  };
}

/** Exercises a user could swap into a slot (Elite: custom split changes). */
export function swapOptions(a: Answers, exId: string): Exercise[] {
  const ex = EXERCISE_BY_ID[exId];
  if (!ex) return [];
  const ctx: Ctx = { a, fixedPair: isFixedPair(a) };
  return candidates(ex.pattern, ctx).filter((e) => e.id !== exId);
}

export function validAnswers(x: unknown): x is Answers {
  const a = x as Answers;
  return (
    !!a &&
    ["muscle", "strength", "fatloss", "fit"].includes(a.goal) &&
    ["new", "some", "year"].includes(a.level) &&
    [2, 3, 4, 5].includes(a.days) &&
    [30, 45, 60].includes(a.minutes) &&
    Array.isArray(a.protect) &&
    Array.isArray(a.gear) &&
    typeof a.dbMax === "number" &&
    a.dbMax >= 0 &&
    a.dbMax <= 200
  );
}
