"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, MainButton } from "@/components/ui/button";
import { Stagger, StaggerItem } from "@/components/ui/motion";
import { CheckoutSheet } from "./checkout-sheet";
import { beatsCompetitor, COACH_MONTH_CENTS, coachSaving, maxYearSavePct, type PublicPlan } from "@/lib/pricing";
import { TIER_TAGS, UNLOCKS, type Tier } from "@/lib/tiers";
import { cn, money } from "@/lib/utils";

const EASE = [0.22, 0.8, 0.24, 1] as const;
export const dollars = (cents: number) => "$" + Math.round(cents / 100).toLocaleString("en-US");

/** A price that rolls to its new value when the billing cycle changes. */
function Price({ cents, k }: { cents: number; k: string }) {
  const reduce = useReducedMotion();
  return (
    <span className="relative inline-flex overflow-hidden">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={k}
          initial={reduce ? false : { y: "60%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduce ? undefined : { y: "-60%", opacity: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="font-display text-[60px] font-bold leading-none tracking-tight tabular-nums"
        >
          {money(cents)}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function PlanCard({ p, period, current, upgrade, onPick }: { p: PublicPlan; period: "month" | "year"; current: boolean; upgrade: boolean; onPick: () => void }) {
  const year = period === "year" && p.yearCents != null;
  const cents = year ? p.yearCents! : p.monthCents;
  const was = year ? p.wasYearCents ?? (p.yearSaveCents ? p.monthCents * 12 : null) : p.wasMonthCents;
  const rec = p.tier === "pro";
  const badge = rec ? (beatsCompetitor(p) ? "Competitor Beat-Down" : "Most popular") : null;
  const coach = coachSaving(p, period);
  return (
    <div
      className={cn(
        "relative flex h-full flex-col rounded-[24px] border p-6 transition-colors",
        rec ? "border-lime bg-[linear-gradient(180deg,rgb(200_255_61/0.10),rgb(200_255_61/0.02)_45%,var(--card))] shadow-[0_0_60px_-20px_rgb(200_255_61/0.45)]" : "border-line bg-card",
      )}
      data-tier={p.tier}
    >
      {badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-lime px-3 py-1 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-lime-ink" data-testid="plan-badge">
          {badge}
        </span>
      )}
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="display text-[28px]">{p.name}</h3>
        {rec && badge !== "Most popular" && <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-lime">Most popular</span>}
      </div>
      <p className="mt-1 text-[14px] text-muted">{TIER_TAGS[p.tier as Tier]}</p>

      <div className="mt-6 flex items-end gap-2">
        <Price cents={cents} k={`${p.id}-${period}`} />
        <span className="pb-1.5 text-[15px] text-muted">/ {year ? "year" : "month"}</span>
      </div>
      <div className="mt-2 flex min-h-[24px] flex-wrap items-center gap-x-3 gap-y-1 text-[14px]">
        {was != null && was > cents && (
          <s className="text-dim decoration-dim/70" data-testid="was-price" aria-label={`was ${money(was)}`}>
            {money(was)}
          </s>
        )}
        <span className="text-fg/80">
          <span className="font-semibold text-fg">{year ? p.perDayYear : p.perDayMonth}</span> a day
        </span>
      </div>
      <div className="mt-2 min-h-[26px]">
        {year && p.yearSaveCents ? (
          <span className="inline-flex rounded-full bg-lime/12 px-2.5 py-1 text-[12.5px] font-semibold text-lime" data-testid="year-save">
            Save {money(p.yearSaveCents)} a year · −{p.yearSavePct}%
          </span>
        ) : p.yearSaveCents ? (
          <span className="text-[13px] text-muted">or {money(p.yearCents!)} a year, save {p.yearSavePct}%</span>
        ) : null}
      </div>

      <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-line bg-white/[0.02] p-3 text-[13.5px] leading-snug" data-testid="coach-value">
        <UserRound size={16} className="mt-0.5 shrink-0 text-lime" />
        <span>
          <span className="font-semibold text-fg">{dollars(coach)} less</span>
          <span className="text-muted"> a {year ? "year" : "month"} than one coach session a week ({dollars(year ? COACH_MONTH_CENTS * 12 : COACH_MONTH_CENTS)})</span>
        </span>
      </div>

      <ul className="mt-5 flex-1 space-y-2.5">
        {UNLOCKS[p.tier].map((u) => (
          <li key={u} className="flex gap-2.5 text-[14.5px]">
            <span className={cn("mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full", rec ? "bg-lime text-lime-ink" : "bg-lime/15 text-lime")}>
              <Check size={12} strokeWidth={3} />
            </span>
            {u}
          </li>
        ))}
      </ul>

      <div className="mt-6">
        {current ? (
          <Button variant="outline" className="w-full" disabled>Your current plan</Button>
        ) : rec ? (
          <MainButton className="w-full" onClick={onPick}>{upgrade ? `Upgrade to ${p.name}` : "Unlock my full plan"}</MainButton>
        ) : (
          <Button variant="outline" size="lg" className="w-full" onClick={onPick}>Choose {p.name}</Button>
        )}
      </div>
    </div>
  );
}

export function PricingTable({
  plans,
  currentTier,
  onPaid,
}: {
  plans: PublicPlan[];
  currentTier: Tier | null;
  onPaid: (ref: string, upgrade: boolean) => void;
}) {
  const hasYearly = plans.some((p) => p.yearCents != null);
  const [period, setPeriod] = useState<"month" | "year">("year");
  const [pick, setPick] = useState<PublicPlan | null>(null);
  const save = maxYearSavePct(plans);

  useEffect(() => {
    fetch("/api/event", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "feature_used", detail: "competitive_pricing" }) }).catch(() => {});
  }, []);

  if (plans.length === 0)
    return (
      <div className="mx-auto max-w-[520px] rounded-[20px] border border-line bg-card p-6 text-center text-[15px]" role="status">
        <div className="font-semibold">Plans are loading.</div>
        <p className="mt-1 text-muted">Your plan is saved. Refresh in a moment to see the prices.</p>
        <Button variant="white" size="sm" className="mt-4" onClick={() => location.reload()}>Refresh</Button>
      </div>
    );

  return (
    <div className="mx-auto max-w-[1080px]">
      {hasYearly && (
        <div className="flex justify-center">
          <div className="relative flex rounded-full border border-line bg-card p-1 text-[14px] font-medium" role="radiogroup" aria-label="Billing cycle">
            {(["month", "year"] as const).map((v) => (
              <button
                key={v}
                role="radio"
                aria-checked={period === v}
                onClick={() => setPeriod(v)}
                className={cn("press relative z-10 rounded-full px-4 py-2 transition-colors", period === v ? "text-ink" : "text-muted hover:text-fg")}
              >
                {period === v && <motion.span layoutId="cycle-pill" className="absolute inset-0 -z-10 rounded-full bg-white" transition={{ duration: 0.35, ease: EASE }} />}
                {v === "month" ? "Monthly" : "Yearly"}
                {v === "year" && save > 0 && <span className={cn("ml-1.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold", period === v ? "bg-lime text-lime-ink" : "bg-lime/15 text-lime")}>−{save}%</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      <Stagger className="mt-10 grid gap-5 lg:grid-cols-3 lg:items-stretch">
        {plans.map((p) => (
          <StaggerItem key={p.id} className={cn(p.tier === "pro" && "order-first lg:order-none")}>
            <PlanCard p={p} period={period} current={currentTier === p.tier} upgrade={!!currentTier} onPick={() => setPick(p)} />
          </StaggerItem>
        ))}
      </Stagger>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[13px] text-muted">
        <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-lime" /> Secure payment by Whop</span>
        <span>Cancel anytime</span>
        <span>Prices in USD</span>
      </div>

      <CheckoutSheet
        open={!!pick}
        plan={pick}
        period={period === "year" && pick?.yearCents != null ? "year" : "month"}
        upgrade={!!currentTier}
        onClose={() => setPick(null)}
        onPaid={(ref) => {
          setPick(null);
          onPaid(ref, !!currentTier);
        }}
      />
    </div>
  );
}
