"use client";

import { useRouter } from "next/navigation";
import { PricingTable } from "@/components/paywall/pricing-table";
import { Reveal } from "@/components/ui/motion";
import type { PublicPlan } from "@/lib/pricing";
import type { Tier } from "@/lib/tiers";

export function PricingClient({ plans, line, tier }: { plans: PublicPlan[]; line: string; tier: Tier | null }) {
  const router = useRouter();
  return (
    <div className="lg:-mx-[80px]">
      <Reveal className="mx-auto max-w-[640px] text-center">
        <div className="label">[ Plans ]</div>
        <h1 className="display mt-3 text-[42px] sm:text-[56px]">{tier ? "Train further for less." : "Your 4-week plan is ready."}</h1>
        <p className="mt-3 text-[16px] text-muted">{tier ? "Every plan costs less than one session with a coach." : line}</p>
      </Reveal>
      <div className="mt-8">
        <PricingTable
          plans={plans}
          currentTier={tier}
          onPaid={(ref, upgrade) => router.push(`/dashboard?paid=1&ref=${encodeURIComponent(ref)}${upgrade ? "&upgrade=1" : ""}`)}
        />
      </div>
    </div>
  );
}
