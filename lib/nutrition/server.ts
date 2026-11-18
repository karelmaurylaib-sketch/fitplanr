import "server-only";
import { getAccess, getActivePlan, getSession } from "../access";
import type { Answers } from "../engine/generate";
import type { Body } from "./plan";

export type NutritionRow = { user_id: string; body: Body; choices: Record<string, string>; updated_at: string };
export type FoodItem = { name: string; portion: string; kcal: number; protein: number; carbs: number; fat: number };
export type FoodLog = {
  id: string;
  eaten_on: string;
  meal: "breakfast" | "lunch" | "dinner";
  title: string;
  items: FoodItem[];
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  source: "plan";
  created_at: string;
};

/** Paid check (getPlan via getAccess). Every nutrition API route starts here. */
export async function nutritionAccess() {
  const { sb, user } = await getSession();
  if (!user) return { error: "auth" as const, status: 401 };
  const access = await getAccess();
  if (!access.kwop.paid || !access.quota) return { error: "paywall" as const, status: 402 };
  return { sb, user, access, quota: access.quota };
}

export async function nutritionContext() {
  const { sb, user } = await getSession();
  const plan = await getActivePlan();
  const answers = (plan?.inputs ?? {}) as Partial<Answers>;
  const { data } = await sb.from("nutrition_profiles").select("*").eq("user_id", user!.id).maybeSingle();
  return { row: (data as NutritionRow | null) ?? null, goal: answers.goal ?? "muscle", days: answers.days ?? 3 };
}
