import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAccess, getActivePlan, getProfile, getSession } from "@/lib/access";
import { getApp } from "@/lib/kwop";
import { toPublicPlans } from "@/lib/pricing";
import { TRIAL_DAYS } from "@/lib/tiers";
import { teaserPlan } from "@/lib/teaser";
import { PlanResult } from "./result";

export const metadata: Metadata = { title: "Your 4-week plan" };
export const dynamic = "force-dynamic";

export default async function PlanPage() {
  const { user } = await getSession();
  if (!user) redirect("/login?next=/plan");
  const [row, access, profile, app] = await Promise.all([getActivePlan(), getAccess(), getProfile(), getApp()]);
  if (!row) redirect("/start");
  const paid = access.kwop.paid;
  const plan = paid ? row.data : teaserPlan(row.data);
  const day1 = row.data.weeks[0].days[0];
  const personal = `${row.data.summary.replace(/\.$/, "")}. Day 1 starts with ${day1.exercises[0]?.name ?? "your first lift"}.`;
  const trialOver = !paid && !!access.trial && !access.trial.active;
  return (
    <PlanResult
      plan={plan}
      locked={!paid}
      plans={toPublicPlans(app.plans)}
      preselect={(trialOver ? access.trial?.planName : null) ?? profile?.intended_plan ?? null}
      shareId={row.share_id}
      personal={personal}
      trialDays={access.trialAvailable ? TRIAL_DAYS : null}
      trialOver={trialOver}
    />
  );
}
