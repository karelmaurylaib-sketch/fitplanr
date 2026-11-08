import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAccess, getActivePlan, getProfile, getSession } from "@/lib/access";
import { StartFlow } from "./flow";

export const metadata: Metadata = { title: "Build my plan" };

export default async function StartPage({ searchParams }: { searchParams: Promise<{ rebuild?: string }> }) {
  const { user } = await getSession();
  if (!user) redirect("/signup");
  const { rebuild } = await searchParams;
  const [profile, plan, access] = await Promise.all([getProfile(), getActivePlan(), getAccess()]);
  // Not paid and a plan already exists: their plan waits under the paywall.
  if (plan && !access.kwop.paid) redirect("/plan");
  if (plan && access.kwop.paid && !rebuild) redirect("/dashboard");
  const initial = rebuild ? {} : profile?.answers ?? {};
  return <StartFlow initial={initial} rebuild={!!rebuild} />;
}
