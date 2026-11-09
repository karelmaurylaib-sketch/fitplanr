import type { Metadata } from "next";
import { getActivePlan } from "@/lib/access";
import { getApp } from "@/lib/kwop";
import { publicPlansFor } from "@/lib/trial";
import { PricingClient } from "./client";

export const metadata: Metadata = { title: "Plans" };

export default async function PricingPage() {
  const [app, plan] = await Promise.all([getApp(), getActivePlan()]);
  const line = plan ? plan.data.summary : "Your plan is built on the gear you actually have.";
  return <PricingClient plans={await publicPlansFor(app.plans)} line={line} />;
}
