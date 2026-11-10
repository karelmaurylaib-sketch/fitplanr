import type { Metadata } from "next";
import { getSession } from "@/lib/access";
import { requirePaid } from "@/lib/guard";
import { aiEnabled } from "@/lib/ai";
import { nutritionContext, type FoodLog } from "@/lib/nutrition/server";
import { NutritionClient } from "./client";

export const metadata: Metadata = { title: "Nutrition" };

export default async function NutritionPage() {
  const { access } = await requirePaid();
  const { sb, user } = await getSession();
  const ctx = await nutritionContext();
  // the person's "today" is local: send the two days around UTC today, the browser keeps its own date
  const d = new Date();
  const iso = (x: Date) => x.toISOString().slice(0, 10);
  const from = iso(new Date(d.getTime() - 86400000));
  const to = iso(new Date(d.getTime() + 86400000));
  const [{ data: logs }, { count }] = await Promise.all([
    sb.from("food_logs").select("*").eq("user_id", user!.id).gte("eaten_on", from).lte("eaten_on", to).order("created_at", { ascending: true }),
    sb.from("meal_scans").select("id", { count: "exact", head: true }).eq("user_id", user!.id).gte("created_at", access.usage.since),
  ]);
  return (
    <NutritionClient
      initialBody={ctx.row?.body ?? null}
      initialChoices={ctx.row?.choices ?? {}}
      goal={ctx.goal}
      days={ctx.days}
      initialLogs={(logs ?? []) as FoodLog[]}
      scans={{ used: count ?? 0, max: access.quota.scans }}
      ai={aiEnabled()}
    />
  );
}
