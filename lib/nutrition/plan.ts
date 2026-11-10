// FitPlanr nutrition plan: deterministic, like the training engine.
// Body (sex, age, height, weight) + training days + goal → daily calories and macros (Mifflin-St Jeor),
// split over breakfast / lunch / dinner, then each meal's portions are solved so the chosen foods hit its targets.
// Swapping a food (pear for apple, tofu for chicken) re-solves the meal so the totals stay on target.

import { FOODS, FOOD_BY_ID, amountLabel, type Food, type FoodCat } from "./foods";
import type { Goal } from "../engine/generate";

export type Body = { sex: "m" | "f"; age: number; heightIn: number; weightLb: number };
export type Macros = { kcal: number; p: number; c: number; f: number };
export type MealKey = "breakfast" | "lunch" | "dinner";
export type LogMeal = MealKey | "snack";

export const MEALS: { key: MealKey; name: string; share: number; time: string }[] = [
  { key: "breakfast", name: "Breakfast", share: 0.3, time: "7–9 am" },
  { key: "lunch", name: "Lunch", share: 0.35, time: "12–2 pm" },
  { key: "dinner", name: "Dinner", share: 0.35, time: "6–8 pm" },
];

/** Slot → options. The first option is the default pick. */
export const SLOTS: Record<MealKey, { slot: string; cat: FoodCat; label: string; options: string[] }[]> = {
  breakfast: [
    { slot: "protein", cat: "protein", label: "Protein", options: ["greek", "eggs", "whites", "cottage", "whey"] },
    { slot: "carb", cat: "carb", label: "Carbs", options: ["oats", "toast", "bagel"] },
    { slot: "fruit", cat: "fruit", label: "Fruit", options: ["berries", "banana", "apple", "pear", "orange"] },
    { slot: "fat", cat: "fat", label: "Healthy fat", options: ["pb", "almonds", "chia", "walnuts"] },
  ],
  lunch: [
    { slot: "protein", cat: "protein", label: "Protein", options: ["chicken", "turkey", "tuna", "beef93", "tofu"] },
    { slot: "carb", cat: "carb", label: "Carbs", options: ["rice_brown", "quinoa", "tortilla", "sweet_potato", "beans"] },
    { slot: "veg", cat: "veg", label: "Vegetables", options: ["salad", "peppers", "spinach", "broccoli"] },
    { slot: "fat", cat: "fat", label: "Healthy fat", options: ["avocado", "olive_oil", "cheese"] },
  ],
  dinner: [
    { slot: "protein", cat: "protein", label: "Protein", options: ["salmon", "chicken", "beef93", "shrimp", "tofu"] },
    { slot: "carb", cat: "carb", label: "Carbs", options: ["sweet_potato", "rice_white", "potato", "pasta", "quinoa"] },
    { slot: "veg", cat: "veg", label: "Vegetables", options: ["broccoli", "green_beans", "asparagus", "salad"] },
    { slot: "fat", cat: "fat", label: "Healthy fat", options: ["olive_oil", "avocado"] },
  ],
};

export const DEFAULT_BODY: Body = { sex: "m", age: 28, heightIn: 70, weightLb: 170 };

const ACTIVITY: Record<number, number> = { 2: 1.375, 3: 1.45, 4: 1.55, 5: 1.6 };
const GOAL_ADJ: Record<Goal, number> = { muscle: 1.1, strength: 1.07, fatloss: 0.8, fit: 1 };
export const GOAL_LINE: Record<Goal, string> = {
  muscle: "A small surplus (+10%) so the extra goes to muscle, not fat.",
  strength: "A slight surplus (+7%) to fuel heavier sessions.",
  fatloss: "A 20% deficit with high protein, so you lose fat and keep muscle.",
  fit: "Maintenance calories with enough protein to recover.",
};

export function dailyTargets(body: Body, goal: Goal, days: number): Macros & { tdee: number } {
  const kg = body.weightLb * 0.4536;
  const cm = body.heightIn * 2.54;
  const bmr = 10 * kg + 6.25 * cm - 5 * body.age + (body.sex === "m" ? 5 : -161);
  const tdee = bmr * (ACTIVITY[days] ?? 1.45);
  const kcal = Math.round((tdee * GOAL_ADJ[goal]) / 10) * 10;
  // protein: 0.8 g per lb (1 g on a cut), capped for very heavy bodies
  const p = Math.round(Math.min(body.weightLb * (goal === "fatloss" ? 1 : 0.8), 230));
  const f = Math.round(Math.max((kcal * 0.27) / 9, body.weightLb * 0.3));
  const c = Math.max(60, Math.round((kcal - p * 4 - f * 9) / 4));
  return { kcal, p, c, f, tdee: Math.round(tdee) };
}

export type PlannedItem = { slot: string; label: string; foodId: string; name: string; amount: number; amountLabel: string; tip?: string } & Macros;
export type PlannedMeal = { key: MealKey; name: string; time: string; target: Macros; items: PlannedItem[]; total: Macros };

const macrosOf = (food: Food, amount: number): Macros => {
  const k = amount / food.qty;
  return { kcal: food.kcal * k, p: food.p * k, c: food.c * k, f: food.f * k };
};
const roundTo = (x: number, step: number) => Math.round(x / step) * step;
const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));
export const sumMacros = (list: Macros[]): Macros =>
  list.reduce((a, m) => ({ kcal: a.kcal + m.kcal, p: a.p + m.p, c: a.c + m.c, f: a.f + m.f }), { kcal: 0, p: 0, c: 0, f: 0 });
export const roundMacros = (m: Macros): Macros => ({ kcal: Math.round(m.kcal), p: Math.round(m.p), c: Math.round(m.c), f: Math.round(m.f) });

/** Portions for one meal: fruit/veg fixed at one serving, then carb → protein → fat solved in turn (two passes). */
export function solveMeal(key: MealKey, target: Macros, picks: Record<string, string>): PlannedMeal {
  const meal = MEALS.find((m) => m.key === key)!;
  const slots = SLOTS[key];
  const food = (slot: string) => FOOD_BY_ID[picks[slot]] && slots.find((s) => s.slot === slot)!.options.includes(picks[slot]) ? FOOD_BY_ID[picks[slot]] : FOOD_BY_ID[slots.find((s) => s.slot === slot)!.options[0]];
  const fixed = slots.filter((s) => s.cat === "fruit" || s.cat === "veg").map((s) => ({ s, food: food(s.slot), amount: food(s.slot).qty }));
  const fixedM = sumMacros(fixed.map((x) => macrosOf(x.food, x.amount)));
  const P = food("protein"), C = food("carb"), F = food("fat");
  const per = (fd: Food) => ({ p: fd.p / fd.qty, c: fd.c / fd.qty, f: fd.f / fd.qty });
  const pp = per(P), cc = per(C), ff = per(F);
  let xp = P.qty, xc = C.qty, xf = F.qty;
  for (let i = 0; i < 3; i++) {
    xc = clamp((target.c - fixedM.c - xp * pp.c - xf * ff.c) / Math.max(cc.c, 0.01), C.step, C.max);
    // a fatty protein (eggs, salmon, tofu) never pushes the meal past its fat target on its own
    const pMax = pp.f > 0 ? Math.min(P.max, Math.max(P.step, (target.f - fixedM.f) / pp.f)) : P.max;
    xp = clamp((target.p - fixedM.p - xc * cc.p - xf * ff.p) / Math.max(pp.p, 0.01), P.step, pMax);
    xf = clamp((target.f - fixedM.f - xp * pp.f - xc * cc.f) / Math.max(ff.f, 0.01), F.step, F.max);
  }
  const solved = [
    { s: slots.find((s) => s.slot === "protein")!, food: P, amount: Math.max(P.step, roundTo(xp, P.step)) },
    { s: slots.find((s) => s.slot === "carb")!, food: C, amount: Math.max(C.step, roundTo(xc, C.step)) },
    ...fixed,
    { s: slots.find((s) => s.slot === "fat")!, food: F, amount: Math.max(F.step, roundTo(xf, F.step)) },
  ];
  const items: PlannedItem[] = solved.map(({ s, food: fd, amount }) => ({
    slot: s.slot,
    label: s.label,
    foodId: fd.id,
    name: fd.name,
    amount,
    amountLabel: amountLabel(fd, amount),
    tip: fd.tip,
    ...roundMacros(macrosOf(fd, amount)),
  }));
  return { key, name: meal.name, time: meal.time, target: roundMacros(target), items, total: roundMacros(sumMacros(items)) };
}

export type NutritionPlan = { daily: Macros & { tdee: number }; meals: PlannedMeal[]; goalLine: string };

export function buildNutrition(body: Body, goal: Goal, days: number, choices: Record<string, string> = {}): NutritionPlan {
  const daily = dailyTargets(body, goal, days);
  const meals = MEALS.map((m) => {
    const picks: Record<string, string> = {};
    for (const s of SLOTS[m.key]) picks[s.slot] = choices[`${m.key}.${s.slot}`] ?? s.options[0];
    return solveMeal(m.key, { kcal: daily.kcal * m.share, p: daily.p * m.share, c: daily.c * m.share, f: daily.f * m.share }, picks);
  });
  return { daily, meals, goalLine: GOAL_LINE[goal] };
}

/** Every option for one slot, each solved in place, so the swap sheet shows the real amount and the macro change. */
export function swapOptions(body: Body, goal: Goal, days: number, choices: Record<string, string>, meal: MealKey, slot: string) {
  const s = SLOTS[meal].find((x) => x.slot === slot);
  if (!s) return [];
  return s.options.map((id) => {
    const plan = buildNutrition(body, goal, days, { ...choices, [`${meal}.${slot}`]: id });
    const m = plan.meals.find((x) => x.key === meal)!;
    return { id, item: m.items.find((i) => i.slot === slot)!, total: m.total };
  });
}

export const FOOD_LIST = FOODS;

/** Meal guess from the local hour, for a new scan. */
export function mealForHour(h: number): LogMeal {
  if (h >= 4 && h < 11) return "breakfast";
  if (h >= 11 && h < 16) return "lunch";
  if (h >= 16 && h < 22) return "dinner";
  return "snack";
}
