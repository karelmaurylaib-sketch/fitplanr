import { NextResponse } from "next/server";
import { z } from "zod";
import { aiEnabled, scanMeal } from "@/lib/ai";
import { track } from "@/lib/kwop";
import { nutritionAccess } from "@/lib/nutrition/server";

export const maxDuration = 60;

const Req = z.object({ image: z.string().min(100).max(2_800_000), type: z.enum(["image/jpeg", "image/png", "image/webp"]) });

/** Photo → estimated items. Counted against the plan's monthly scans only when the AI actually reads a photo. */
export async function POST(req: Request) {
  const a = await nutritionAccess();
  if ("error" in a) return NextResponse.json({ error: a.error }, { status: a.status });
  if (!aiEnabled()) return NextResponse.json({ mode: "manual" });
  if (a.scansUsed >= a.quota.scans) return NextResponse.json({ error: "quota", kind: "scans", max: a.quota.scans }, { status: 402 });
  const parsed = Req.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const image = parsed.data.image.replace(/^data:[^,]+,/, "");
  const r = await scanMeal(image, parsed.data.type);
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: r.error === "not_food" ? 422 : 502 });
  const { data: row } = await a.sb.from("meal_scans").insert({ user_id: a.user.id, result: r.scan }).select("id").single();
  track("feature_used", a.user.email, "nutrition_meal_scan");
  return NextResponse.json({ mode: "ai", scanId: row?.id ?? null, ...r.scan, left: Math.max(0, a.quota.scans - a.scansUsed - 1) });
}
