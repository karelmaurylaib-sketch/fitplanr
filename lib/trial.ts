import "server-only";
import { supabaseAdmin } from "./supabase/admin";
import { TRIAL_DAYS, tierOf, type Tier } from "./tiers";

export type Trial = { tier: Tier; planId: number; planName: string; startedAt: string; endsAt: string; active: boolean; daysLeft: number };

type Row = { tier: string; plan_id: number; plan_name: string; started_at: string; ends_at: string };

function toTrial(r: Row, now = Date.now()): Trial {
  const end = new Date(r.ends_at).getTime();
  return {
    tier: (tierOf(r.plan_name) ?? r.tier) as Tier,
    planId: r.plan_id,
    planName: r.plan_name,
    startedAt: r.started_at,
    endsAt: r.ends_at,
    active: end > now,
    daysLeft: Math.max(0, Math.ceil((end - now) / 86400000)),
  };
}

/** The free week of this email, if it ever started one (active or over). Read with the service role. */
export async function getTrial(email: string | null | undefined): Promise<Trial | null> {
  if (!email) return null;
  try {
    const { data, error } = await supabaseAdmin().from("trials").select("tier, plan_id, plan_name, started_at, ends_at").eq("email", email.toLowerCase()).maybeSingle();
    if (error) throw error;
    return data ? toTrial(data as Row) : null;
  } catch (e) {
    console.error("[trial] read failed", e);
    return null;
  }
}

/** Starts the free week on one Kwop plan. One per email, ever. Returns null when it was already used. */
export async function startTrial(user: { id: string; email: string }, plan: { id: number; name: string }): Promise<Trial | null> {
  const tier = tierOf(plan.name) ?? "starter";
  const now = new Date();
  const row = {
    email: user.email.toLowerCase(),
    user_id: user.id,
    tier,
    plan_id: plan.id,
    plan_name: plan.name,
    started_at: now.toISOString(),
    ends_at: new Date(now.getTime() + TRIAL_DAYS * 86400000).toISOString(),
  };
  const { data, error } = await supabaseAdmin().from("trials").upsert(row, { onConflict: "email", ignoreDuplicates: true }).select("tier, plan_id, plan_name, started_at, ends_at");
  if (error) throw error;
  if (!data || data.length === 0) return null; // already used
  return toTrial(data[0] as Row);
}
