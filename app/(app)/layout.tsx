import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { TrialBar, UpgradeProvider } from "@/components/paywall/upgrade";
import { getAccess, getSession } from "@/lib/access";
import { getApp } from "@/lib/kwop";
import { toPublicPlans } from "@/lib/pricing";
import { shortPlanName } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = await getSession();
  if (!user) redirect("/login");
  const [access, app] = await Promise.all([getAccess(), getApp()]);
  const trialing = access.kwop.status === "trialing" && access.trial?.active;
  const trial = trialing && access.trial ? { tier: access.trial.tier, planName: shortPlanName(access.trial.planName), endsAt: access.trial.endsAt, daysLeft: access.trial.daysLeft } : null;
  return (
    <UpgradeProvider plans={toPublicPlans(app.plans)} tier={access.tier} trial={trial}>
      <AppShell planName={access.kwop.plan ? shortPlanName(access.kwop.plan.name) + (trial ? " · trial" : "") : null}>
        {trial && <TrialBar trial={trial} />}
        {children}
      </AppShell>
    </UpgradeProvider>
  );
}
