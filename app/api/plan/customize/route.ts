import { NextResponse } from "next/server";
import { z } from "zod";
import { getAccess, getActivePlan, getSession } from "@/lib/access";
import { generatePlan, swapOptions } from "@/lib/engine/generate";
import { track } from "@/lib/kwop";

const Body = z.object({
  swaps: z.record(z.string().regex(/^d\d-\d$/), z.string().max(60)),
  dayOrder: z.array(z.number().int().min(0).max(6)).max(7),
  deload: z.boolean(),
});

export async function POST(req: Request) {
  const { sb, user } = await getSession();
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 });
  const access = await getAccess();
  if (!access.quota?.swaps) return NextResponse.json({ error: "paywall" }, { status: 402 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const plan = await getActivePlan();
  if (!plan) return NextResponse.json({ error: "plan" }, { status: 404 });
  const a = plan.inputs;
  const perWeek = generatePlan(a).weeks[0].days.length;
  const order = parsed.data.dayOrder;
  if (order.length !== perWeek || new Set(order).size !== perWeek || order.some((i) => i >= perWeek)) return NextResponse.json({ error: "order" }, { status: 400 });
  // only keep swaps the user's gear allows
  const base = generatePlan(a).weeks[0].days;
  const swaps: Record<string, string> = {};
  for (const [slot, id] of Object.entries(parsed.data.swaps)) {
    const [d, i] = slot.slice(1).split("-").map(Number);
    const orig = base[d - 1]?.exercises[i - 1];
    if (orig && swapOptions(a, orig.exId).some((o) => o.id === id)) swaps[slot] = id;
  }
  const options = { swaps, dayOrder: order, deload: parsed.data.deload };
  const data = generatePlan(a, options);
  const { error } = await sb.from("plans").update({ options, data }).eq("id", plan.id).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: "save" }, { status: 500 });
  track("feature_used", user.email, "custom_split");
  return NextResponse.json({ ok: true });
}
