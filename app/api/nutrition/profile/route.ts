import { NextResponse } from "next/server";
import { z } from "zod";
import { track } from "@/lib/kwop";
import { nutritionAccess } from "@/lib/nutrition/server";
import { SLOTS, type MealKey } from "@/lib/nutrition/plan";

const BodyZ = z.object({ sex: z.enum(["m", "f"]), age: z.number().int().min(16).max(90), heightIn: z.number().int().min(52).max(90), weightLb: z.number().int().min(80).max(450) });
const Req = z.object({
  body: BodyZ.optional(),
  swap: z.object({ meal: z.enum(["breakfast", "lunch", "dinner"]), slot: z.string().max(20), food: z.string().max(30) }).optional(),
});

/** Save body numbers (sets the targets) and/or one food swap. */
export async function PUT(req: Request) {
  const a = await nutritionAccess();
  if ("error" in a) return NextResponse.json({ error: a.error }, { status: a.status });
  const parsed = Req.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const { body, swap } = parsed.data;
  const { data: cur } = await a.sb.from("nutrition_profiles").select("body, choices").eq("user_id", a.user.id).maybeSingle();
  if (!cur && !body) return NextResponse.json({ error: "no_body" }, { status: 400 });
  const choices: Record<string, string> = { ...((cur?.choices as Record<string, string>) ?? {}) };
  if (swap) {
    const s = SLOTS[swap.meal as MealKey].find((x) => x.slot === swap.slot);
    if (!s || !s.options.includes(swap.food)) return NextResponse.json({ error: "invalid" }, { status: 400 });
    choices[`${swap.meal}.${swap.slot}`] = swap.food;
  }
  const { error } = await a.sb.from("nutrition_profiles").upsert({ user_id: a.user.id, body: body ?? cur!.body, choices, updated_at: new Date().toISOString() });
  if (error) return NextResponse.json({ error: "save" }, { status: 500 });
  track("feature_used", a.user.email, swap ? "nutrition_swap" : "nutrition_plan");
  return NextResponse.json({ ok: true, choices });
}
