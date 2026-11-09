"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Paywall } from "@/components/paywall/paywall";
import type { PublicPlan } from "@/lib/pricing";

export function PricingClient({ plans, line, trialDays }: { plans: PublicPlan[]; line: string; trialDays: number | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const close = useCallback(() => {
    setOpen(false);
    router.push("/plan");
  }, [router]);
  return (
    <Paywall
      open={open}
      onClose={close}
      plans={plans}
      title="Your 4-week plan is ready."
      line={line}
      onPaid={(ref) => router.push(`/dashboard?paid=1&ref=${encodeURIComponent(ref)}`)}
      trialDays={trialDays}
      onTrial={() => {
        router.push("/dashboard");
        router.refresh();
      }}
    />
  );
}
