import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/access";
import { track } from "@/lib/kwop";
import { LIMITS } from "@/lib/engine/muscles";

// Muscle Map & Calorie Burn Estimator: the person's sex (body model), weight and age.
const Body = z
  .object({
    sex: z.enum(["male", "female"]),
    weightLb: z.number().min(LIMITS.weight[0]).max(LIMITS.weight[1]).nullable(),
    age: z.number().int().min(LIMITS.age[0]).max(LIMITS.age[1]).nullable(),
  })
  .strict();

export async function GET() {
  const { sb, user } = await getSession();
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 });
  const { data, error } = await sb.from("body_stats").select("sex, weight_lb, age").eq("user_id", user.id).maybeSingle();
  if (error) return NextResponse.json({ error: "load" }, { status: 500 });
  return NextResponse.json({ stats: data ? { sex: data.sex, weightLb: data.weight_lb === null ? null : Number(data.weight_lb), age: data.age } : null });
}

export async function PUT(req: Request) {
  const { sb, user } = await getSession();
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const { sex, weightLb, age } = parsed.data;
  const { data: before } = await sb.from("body_stats").select("weight_lb, age").eq("user_id", user.id).maybeSingle();
  const { error } = await sb
    .from("body_stats")
    .upsert({ user_id: user.id, sex, weight_lb: weightLb === null ? null : Math.round(weightLb * 10) / 10, age, updated_at: new Date().toISOString() });
  if (error) return NextResponse.json({ error: "save" }, { status: 500 });
  // count a calorie estimate once per new set of numbers, not on every body-model toggle
  if (weightLb !== null && age !== null && (Number(before?.weight_lb) !== weightLb || before?.age !== age)) track("feature_used", user.email, "calorie_estimator");
  return NextResponse.json({ ok: true });
}
