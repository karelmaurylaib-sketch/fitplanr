import type { Metadata } from "next";
import { getAccess, getActivePlan } from "@/lib/access";
import { getApp } from "@/lib/kwop";
import { toPublicPlans } from "@/lib/pricing";
import { TRIAL_DAYS } from "@/lib/tiers";
import { PricingClient } from "./client";

export const metadata: Metadata = { title: "Plans" };

export default async function PricingPage() {
  const [app, plan, access] = await Promise.all([getApp(), getActivePlan(), getAccess()]);
  const line = plan ? plan.data.summary : "Your plan is built on the gear you actually have.";
  return <PricingClient plans={toPublicPlans(app.plans)} line={line} trialDays={access.trialAvailable ? TRIAL_DAYS : null} />;
}
