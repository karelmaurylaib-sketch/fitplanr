import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { UpgradeProvider } from "@/components/paywall/upgrade";
import { getAccess, getSession } from "@/lib/access";
import { getApp } from "@/lib/kwop";
import { publicPlansFor } from "@/lib/trial";
import { shortPlanName } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = await getSession();
  if (!user) redirect("/login");
  const [access, app] = await Promise.all([getAccess(), getApp()]);
  return (
    <UpgradeProvider plans={await publicPlansFor(app.plans)} tier={access.tier}>
      <AppShell planName={access.kwop.plan ? shortPlanName(access.kwop.plan.name) : null}>{children}</AppShell>
    </UpgradeProvider>
  );
}
