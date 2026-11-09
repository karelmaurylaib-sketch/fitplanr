import { NextResponse } from "next/server";
import { z } from "zod";
import { getProfile, getSession } from "@/lib/access";
import { createCheckout, getApp } from "@/lib/kwop";
import { tierOf } from "@/lib/tiers";
import { billingTrialDays, rememberTrialCheckout, trialEligible } from "@/lib/trial";

const Body = z.object({ plan: z.number().int().positive(), period: z.enum(["month", "year"]), upgrade: z.boolean().optional() });

export async function POST(req: Request) {
  const { user } = await getSession();
  if (!user?.email) return NextResponse.json({ error: "auth" }, { status: 401 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const app = await getApp();
  const plan = app.plans.find((p) => p.id === parsed.data.plan);
  if (!plan) return NextResponse.json({ error: "plan" }, { status: 400 });
  if (parsed.data.period === "year" && !plan.yearly) return NextResponse.json({ error: "period" }, { status: 400 });
  const profile = await getProfile();
  // the free week is decided here, never by the browser: Starter/Pro only, billing must defer the charge, one per account
  const billingDays = billingTrialDays(plan);
  const trialDays = billingDays > 0 && !parsed.data.upgrade && (await trialEligible()) ? billingDays : 0;
  try {
    const { status, data } = await createCheckout({ plan: plan.id, period: parsed.data.period, email: user.email, k: profile?.k, trial_days: trialDays || undefined });
    if (status === 409) return NextResponse.json({ error: "payments_off" }, { status: 409 });
    if (status >= 400 || !data.ref) {
      console.error("[checkout] kwop answered", status, data);
      return NextResponse.json({ error: "checkout" }, { status: 502 });
    }
    if (trialDays) {
      const period = parsed.data.period;
      await rememberTrialCheckout(user.id, {
        plan_id: plan.id,
        tier: tierOf(plan.name)!,
        period,
        ref: data.ref,
        days: trialDays,
        price_cents: period === "year" && plan.yearly ? plan.yearly.price_cents : plan.price_cents,
      });
    }
    return NextResponse.json({ embed: data.embed ?? null, ref: data.ref, fallback_url: data.fallback_url, trial_days: trialDays });
  } catch (e) {
    console.error("[checkout] failed", e);
    return NextResponse.json({ error: "checkout" }, { status: 502 });
  }
}
