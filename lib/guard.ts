import "server-only";
import { redirect } from "next/navigation";
import { getAccess, getActivePlan, getProfile } from "./access";
import type { Answers } from "./engine/generate";

/** Paid pages: checked on the server with getPlan(), never trusted from the browser. */
export async function requirePaid() {
  const [access, plan, profile] = await Promise.all([getAccess(), getActivePlan(), getProfile()]);
  if (!access.kwop.paid || !access.quota || !access.tier) redirect(plan ? "/plan" : "/start");
  if (!plan) redirect("/start");
  return { access: access as typeof access & { quota: NonNullable<typeof access.quota>; tier: NonNullable<typeof access.tier> }, plan, profile, answers: plan.inputs as Answers };
}
