import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { track } from "@/lib/kwop";
import { nutritionAccess } from "@/lib/nutrition/server";

const Item = z.object({ name: z.string().min(1).max(60), portion: z.string().max(40), kcal: z.number().min(0).max(3000), protein: z.number().min(0).max(300), carbs: z.number().min(0).max(400), fat: z.number().min(0).max(300) });
const Req = z.object({
  eatenOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  meal: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  title: z.string().min(1).max(60),
  items: z.array(Item).min(1).max(16),
  source: z.enum(["scan", "plan", "manual"]),
  scanId: z.string().uuid().nullable().optional(),
});

/** Add a meal to a day: totals are summed on the server from the items. */
export async function POST(req: Request) {
  const a = await nutritionAccess();
  if ("error" in a) return NextResponse.json({ error: a.error }, { status: a.status });
  const parsed = Req.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const b = parsed.data;
  const sum = (k: "kcal" | "protein" | "carbs" | "fat") => Math.round(b.items.reduce((s, i) => s + i[k], 0));
  const { data, error } = await a.sb
    .from("food_logs")
    .insert({
      user_id: a.user.id,
      eaten_on: b.eatenOn,
      meal: b.meal,
      title: b.title,
      items: b.items.map((i) => ({ ...i, kcal: Math.round(i.kcal), protein: Math.round(i.protein), carbs: Math.round(i.carbs), fat: Math.round(i.fat) })),
      kcal: sum("kcal"),
      protein: sum("protein"),
      carbs: sum("carbs"),
      fat: sum("fat"),
      source: b.source,
      scan_id: b.scanId ?? null,
      share_id: b.source === "plan" ? null : randomBytes(6).toString("base64url"),
    })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: "save" }, { status: 500 });
  if (b.source !== "scan") track("feature_used", a.user.email, "nutrition_log");
  return NextResponse.json({ ok: true, log: data });
}

export async function DELETE(req: Request) {
  const a = await nutritionAccess();
  if ("error" in a) return NextResponse.json({ error: a.error }, { status: a.status });
  const id = new URL(req.url).searchParams.get("id") ?? "";
  if (!/^[0-9a-f-]{36}$/.test(id)) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const { error } = await a.sb.from("food_logs").delete().eq("id", id).eq("user_id", a.user.id);
  if (error) return NextResponse.json({ error: "save" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
