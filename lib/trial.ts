import "server-only";
import { getSession } from "./access";
import { getPlan, type KwopPlan } from "./kwop";
import { toPublicPlans } from "./pricing";
import { supabaseAdmin } from "./supabase/admin";
import { TRIAL_DAYS, TRIAL_TIERS, tierOf, type Tier } from "./tiers";

export type TrialRow = {
  user_id: string;
  plan_id: number;
  tier: Tier;
  period: "month" | "year";
  ref: string | null;
  days: number;
  status: "pending" | "active" | "canceled" | "converted";
  price_cents: number;
  started_at: string | null;
  ends_at: string | null;
  canceled_at: string | null;
};

/**
 * Does billing really defer the first charge on this plan? The trial is only ever shown when it does:
 * either Kwop reports trial days on the plan, or the owner set FITPLANR_TRIAL=1 after adding the 7-day
 * trial to the Starter and Pro plans in Kwop. Elite never gets one.
 */
export function billingTrialDays(plan: KwopPlan): number {
  if (!TRIAL_TIERS.includes(tierOf(plan.name) ?? "elite")) return 0;
  const reported = Number(plan.trial_days ?? plan.trial_period_days ?? 0);
  if (reported > 0) return Math.min(reported, TRIAL_DAYS);
  return process.env.FITPLANR_TRIAL === "1" ? TRIAL_DAYS : 0;
}

/** The current user's trial row (RLS: own row only). */
export async function getTrial(): Promise<TrialRow | null> {
  const { sb, user } = await getSession();
  if (!user) return null;
  const { data } = await sb.from("trials").select("*").eq("user_id", user.id).maybeSingle();
  const row = (data as TrialRow) ?? null;
  if (row?.status === "active" && row.ends_at && new Date(row.ends_at) <= new Date()) {
    // the week is over and it wasn't canceled: billing charged the plan, the trial is now a subscription
    row.status = "converted";
    await supabaseAdmin().from("trials").update({ status: "converted" }).eq("user_id", user.id).eq("status", "active");
  }
  return row;
}

/** One trial per account, for people who don't already pay. A checkout that was opened but never paid doesn't count. */
export async function trialEligible(): Promise<boolean> {
  const { user } = await getSession();
  if (!user?.email) return false;
  const [trial, access] = await Promise.all([getTrial(), getPlan(user.email)]);
  if (access.paid) return false;
  return !trial || trial.status === "pending";
}

/** Plans for the browser, with trialDays set only where this person really gets a free week. */
export async function publicPlansFor(plans: KwopPlan[]) {
  const live = plans.some((p) => billingTrialDays(p) > 0);
  const eligible = live ? await trialEligible().catch(() => false) : false;
  return toPublicPlans(plans, (p) => (eligible ? billingTrialDays(p) : 0));
}

/** Checkout opened with a trial: remember which one, so the payment that follows starts it. */
export async function rememberTrialCheckout(userId: string, t: { plan_id: number; tier: Tier; period: "month" | "year"; ref: string; days: number; price_cents: number }) {
  const { error } = await supabaseAdmin()
    .from("trials")
    .upsert({ user_id: userId, ...t, status: "pending", started_at: null }, { onConflict: "user_id" });
  if (error) console.error("[trial] remember failed", error.message);
}

/** Payment details entered and confirmed: the 7 days start now (ends_at is set by the database). */
export async function startTrial(userId: string, ref: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin()
    .from("trials")
    .update({ status: "active", started_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("status", "pending")
    .eq("ref", ref)
    .select("user_id");
  if (error) console.error("[trial] start failed", error.message);
  return !!data?.length;
}

/** Canceled during the free week: no charge will happen, access runs to the end of the trial. */
export async function cancelTrial(userId: string) {
  const { error } = await supabaseAdmin()
    .from("trials")
    .update({ status: "canceled", canceled_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("status", "active")
    .gt("ends_at", new Date().toISOString());
  if (error) console.error("[trial] cancel failed", error.message);
}
