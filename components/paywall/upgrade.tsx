"use client";

import { Check, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { Sheet } from "@/components/ui/sheet";
import { MainButton } from "@/components/ui/button";
import { CheckoutSheet } from "./checkout-sheet";
import { UnlockFilm } from "@/components/unlock-film";
import { fmt, type PublicPlan } from "@/lib/pricing";
import { ADDS, TIER_ORDER, type Tier } from "@/lib/tiers";
import { cn } from "@/lib/utils";

type Ctx = { open: (reason?: string, target?: Tier) => void };
const UpgradeCtx = createContext<Ctx>({ open: () => {} });
export const useUpgrade = () => useContext(UpgradeCtx);

/** The upgrade sheet: the next plan only, what it adds in 3 lines, its price a day, one button → checkout in the page. */
export function UpgradeProvider({ plans, tier, children }: { plans: PublicPlan[]; tier: Tier | null; children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<{ open: boolean; reason?: string; target?: Tier }>({ open: false });
  const [checkout, setCheckout] = useState(false);
  const [film, setFilm] = useState<string | null>(null);

  const nextOf = (t: Tier | null): Tier | null => (t ? TIER_ORDER[TIER_ORDER.indexOf(t) + 1] ?? null : "pro");
  const targetTier = state.target ?? nextOf(tier);
  const plan = plans.find((p) => p.tier === targetTier) ?? null;

  const open = useCallback((reason?: string, target?: Tier) => {
    setState({ open: true, reason, target });
    fetch("/api/event", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "paywall_view" }) }).catch(() => {});
  }, []);

  async function paid(ref: string) {
    setCheckout(false);
    setState({ open: false });
    try {
      const r = await fetch("/api/checkout/confirm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ref, upgrade: !!tier }) });
      const j = await r.json();
      if (j.paid) {
        setFilm(j.plan?.name ?? plan?.name ?? "your new plan");
        return;
      }
    } catch {}
    router.push(`/dashboard?paid=1&ref=${encodeURIComponent(ref)}${tier ? "&upgrade=1" : ""}`);
  }

  return (
    <UpgradeCtx.Provider value={{ open }}>
      {children}
      <Sheet open={state.open} onClose={() => setState({ open: false })} variant="bottom" label="Upgrade" closeSide="right" width={460}>
        <div className="overflow-y-auto px-5 pb-7 pt-2 sm:px-7 sm:pt-7">
          {plan ? (
            <>
              <div className="label">[ {state.reason ?? "Go further"} ]</div>
              <h2 className="display mt-2 pr-12 text-[34px]">Unlock with {plan.name}</h2>
              <ul className="mt-5 space-y-3">
                {ADDS[plan.tier].map((a) => (
                  <li key={a} className="flex gap-3 text-[16px]">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lime/15 text-lime"><Check size={13} strokeWidth={3} /></span>
                    {a}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex items-end justify-between rounded-2xl border border-line bg-card p-4">
                <div>
                  <div className="text-[16px] font-semibold">{plan.name}</div>
                  <div className="text-[13px] text-muted">{fmt(plan.monthCents)} / month</div>
                </div>
                <div className="text-right">
                  <span className="font-display text-[32px] font-bold leading-none">{plan.perDayMonth}</span>
                  <span className="block text-[12px] text-muted">/ day</span>
                </div>
              </div>
              <MainButton className="mt-5 w-full" onClick={() => setCheckout(true)}>
                Continue with {plan.name}
              </MainButton>
              <p className="mt-3 text-center text-[13px] text-muted">{tier ? "Your current plan stops at the end of its period. Never billed twice." : "Cancel anytime"}</p>
            </>
          ) : (
            <>
              <h2 className="display mt-2 pr-12 text-[32px]">You&apos;re on the top plan</h2>
              <p className="mt-3 text-muted">Your limits reset at the start of your next billing period.</p>
            </>
          )}
        </div>
      </Sheet>
      <CheckoutSheet open={checkout} plan={plan} period="month" upgrade={!!tier} onClose={() => setCheckout(false)} onPaid={paid} />
      <UnlockFilm
        open={!!film}
        planName={film ?? ""}
        onDone={() => {
          setFilm(null);
          router.refresh();
        }}
      />
    </UpgradeCtx.Provider>
  );
}

/** A locked part: its real preview blurred, with "Unlock with <next plan>". */
export function LockedPart({ children, label, target, className }: { children: ReactNode; label: string; target?: Tier; className?: string }) {
  const { open } = useUpgrade();
  return (
    <div className={cn("relative overflow-hidden rounded-[20px]", className)}>
      <div className="pointer-events-none select-none blur-[6px]" aria-hidden>
        {children}
      </div>
      <button onClick={() => open(label, target)} className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-b from-transparent via-bg/40 to-bg/70 text-center">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10"><Lock size={17} /></span>
        <span className="text-[15px] font-semibold">{label}</span>
      </button>
    </div>
  );
}
