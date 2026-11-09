import type { Metadata } from "next";
import { PageTitle } from "@/components/app-shell";
import { getAccess, getSession } from "@/lib/access";
import { fmtDate, shortPlanName } from "@/lib/utils";
import { getTrial } from "@/lib/trial";
import { AccountClient, type TrialInfo } from "./client";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ upgrade?: string }> }) {
  const { user } = await getSession();
  const [access, row] = await Promise.all([getAccess(), getTrial()]);
  const trial: TrialInfo | null =
    access.kwop.paid && row && row.ends_at && (row.status === "active" || row.status === "canceled")
      ? { status: row.status, days: row.days, endsAt: row.ends_at, endLabel: fmtDate(row.ends_at), priceCents: row.price_cents, period: row.period }
      : null;
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
        trial={trial}
      />
    </div>
  );
}
