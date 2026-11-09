import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/access";
import { getApp, getPlan, track } from "@/lib/kwop";
import { startTrial } from "@/lib/trial";

const Body = z.object({ plan: z.number().int().positive() });

/** Starts the free week on the plan picked in the paywall. No card. One per email, checked on the server. */
export async function POST(req: Request) {
  const { user } = await getSession();
  if (!user?.email) return NextResponse.json({ error: "auth" }, { status: 401 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const app = await getApp();
  const plan = app.plans.find((p) => p.id === parsed.data.plan);
  if (!plan) return NextResponse.json({ error: "plan" }, { status: 400 });
  const paid = await getPlan(user.email, { fresh: true });
  if (paid.paid) return NextResponse.json({ error: "already_paid" }, { status: 409 });
  try {
    const trial = await startTrial({ id: user.id, email: user.email }, plan);
    if (!trial) return NextResponse.json({ error: "trial_used" }, { status: 409 });
    track("feature_used", user.email, `trial_start:${plan.name}`);
    return NextResponse.json({ ok: true, plan: { id: plan.id, name: plan.name }, ends_at: trial.endsAt });
  } catch (e) {
    console.error("[trial] start failed", e);
    return NextResponse.json({ error: "trial" }, { status: 502 });
  }
}
