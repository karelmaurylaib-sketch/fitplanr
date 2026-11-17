import type { Metadata } from "next";
import { PageTitle } from "@/components/app-shell";
import { getAccess, getSession } from "@/lib/access";
import { fmtDate, shortPlanName } from "@/lib/utils";
import { AccountClient } from "./client";

export const metadata: Metadata = { title: "Account", robots: { index: false, follow: false } };

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ upgrade?: string }> }) {
  const { user } = await getSession();
  const access = await getAccess();
  const sp = await searchParams;
  return (
    <div>
      <PageTitle label="Account" title="Your account" />
      <AccountClient
        email={user!.email ?? ""}
        paid={access.kwop.paid}
        planName={access.kwop.plan ? shortPlanName(access.kwop.plan.name) : null}
        status={access.kwop.status}
        until={access.kwop.until ? fmtDate(access.kwop.until) : null}
        tier={access.tier}
        openUpgrade={sp.upgrade === "1"}
      />
    </div>
  );
}
