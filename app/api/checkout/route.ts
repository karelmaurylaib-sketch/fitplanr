import { NextResponse } from "next/server";
import { z } from "zod";
import { getProfile, getSession } from "@/lib/access";
import { createCheckout, getApp } from "@/lib/kwop";
import { toPublicPlans } from "@/lib/pricing";

const Body = z.object({ plan: z.number().int().positive(), period: z.enum(["month", "year"]), upgrade: z.boolean().optional(), cents: z.number().int().nonnegative().optional() });

export async function POST(req: Request) {
  const { user } = await getSession();
  if (!user?.email) return NextResponse.json({ error: "auth" }, { status: 401 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const app = await getApp();
  const plan = app.plans.find((p) => p.id === parsed.data.plan);
  if (!plan) return NextResponse.json({ error: "plan" }, { status: 400 });
  if (parsed.data.period === "year" && !plan.yearly) return NextResponse.json({ error: "period" }, { status: 400 });
  // The price the person saw must be the price Kwop charges now: a stale page never checks out at another amount.
  const live = toPublicPlans([plan])[0];
  const liveCents = parsed.data.period === "year" ? live.yearCents : live.monthCents;
  if (parsed.data.cents != null && parsed.data.cents !== liveCents) return NextResponse.json({ error: "price_changed", cents: liveCents }, { status: 409 });
  const profile = await getProfile();
  try {
    const { status, data } = await createCheckout({ plan: plan.id, period: parsed.data.period, email: user.email, k: profile?.k });
    if (status === 409) return NextResponse.json({ error: "payments_off" }, { status: 409 });
    if (status >= 400 || !data.ref) {
      console.error("[checkout] kwop answered", status, data);
      return NextResponse.json({ error: "checkout" }, { status: 502 });
    }
    return NextResponse.json({ embed: data.embed ?? null, ref: data.ref, fallback_url: data.fallback_url });
  } catch (e) {
    console.error("[checkout] failed", e);
    return NextResponse.json({ error: "checkout" }, { status: 502 });
  }
}
