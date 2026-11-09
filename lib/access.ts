import "server-only";
import { cache } from "react";
import { supabaseServer } from "./supabase/server";
import { getPlan, type KwopAccess } from "./kwop";
import { QUOTAS, periodStart, tierOf, type Quota, type Tier } from "./tiers";
import { getTrial, type Trial } from "./trial";
import type { Answers, Plan } from "./engine/generate";

export type Profile = {
  id: string;
  email: string | null;
  answers: Partial<Answers> & { [k: string]: unknown };
  k: string | null;
  intended_plan: string | null;
  source: string | null;
  units: string;
  onboarded: boolean;
  unlocked_seen: boolean;
  created_at: string;
};

export type PlanRow = { id: string; user_id: string; inputs: Answers; options: Record<string, unknown>; data: Plan; is_active: boolean; share_id: string | null; created_at: string };

export const getSession = cache(async () => {
  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  return { sb, user };
});

export const getProfile = cache(async (): Promise<Profile | null> => {
  const { sb, user } = await getSession();
  if (!user) return null;
  const { data } = await sb.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (data) return data as Profile;
  // trigger missed (should not happen): create it
  const { data: created } = await sb.from("profiles").insert({ id: user.id, email: user.email }).select("*").single();
  return created as Profile;
});

export type Access = {
  kwop: KwopAccess;
  tier: Tier | null;
  quota: Quota | null;
  usage: { rebuilds: number; workouts: number; since: string };
  /** The free week: active → the app treats it as that plan (kwop.status = "trialing"). */
  trial: Trial | null;
  /** True when this person can still start a free week (never paid, never trialed). */
  trialAvailable: boolean;
};

export const getAccess = cache(async (opts: { fresh?: boolean } = {}): Promise<Access> => {
  const { sb, user } = await getSession();
  const [paidPlan, trial] = await Promise.all([getPlan(user?.email, opts), getTrial(user?.email)]);
  // A paid Kwop plan always wins. Otherwise an active free week gives that plan's access until it ends.
  const trialing = !paidPlan.paid && !!trial?.active;
  const kwop: KwopAccess = trialing ? { paid: true, plan: { id: trial!.planId, name: trial!.planName }, status: "trialing", until: trial!.endsAt } : paidPlan;
  const tier = kwop.paid ? tierOf(kwop.plan?.name) : null;
  const quota = tier ? QUOTAS[tier] : null;
  const since = (trialing ? new Date(trial!.startedAt) : periodStart(kwop.until)).toISOString();
  let rebuilds = 0;
  let workouts = 0;
  if (user) {
    const [p, w] = await Promise.all([
      sb.from("plans").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("created_at", since),
      sb.from("workout_logs").select("id", { count: "exact", head: true }).eq("user_id", user.id).not("finished_at", "is", null).gte("finished_at", since),
    ]);
    // the very first plan of the account does not count as a rebuild
    const { count: total } = await sb.from("plans").select("id", { count: "exact", head: true }).eq("user_id", user.id);
    rebuilds = Math.max(0, (p.count ?? 0) - ((total ?? 0) === (p.count ?? 0) ? 1 : 0));
    workouts = w.count ?? 0;
  }
  return { kwop, tier, quota, usage: { rebuilds, workouts, since }, trial, trialAvailable: !!user && !paidPlan.paid && !trial };
});

export async function getActivePlan(): Promise<PlanRow | null> {
  const { sb, user } = await getSession();
  if (!user) return null;
  const { data } = await sb.from("plans").select("*").eq("user_id", user.id).eq("is_active", true).order("created_at", { ascending: false }).limit(1).maybeSingle();
  return (data as PlanRow) ?? null;
}
