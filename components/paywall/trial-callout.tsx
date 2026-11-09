"use client";

import { motion, useReducedMotion } from "framer-motion";
import { fmt, priceFor, trialEndLabel, type PublicPlan } from "@/lib/pricing";
import { cn } from "@/lib/utils";

const EASE = [0.22, 0.8, 0.24, 1] as const;

/** Signature progress ring: 7 days drawn as 7 segments, the first one lit (today). */
function DaysRing({ days }: { days: number }) {
  const reduce = useReducedMotion();
  const r = 19;
  const c = 2 * Math.PI * r;
  const gap = 3;
  const seg = c / days - gap;
  return (
    <span
      className="relative flex h-[52px] w-[52px] shrink-0 items-center justify-center"
      aria-hidden
    >
      <svg viewBox="0 0 48 48" className="absolute inset-0 -rotate-90">
        {Array.from({ length: days }).map((_, i) => (
          <motion.circle
            key={i}
            cx="24"
            cy="24"
            r={r}
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            className={i === 0 ? "stroke-lime" : "stroke-lime/25"}
            strokeDasharray={`${seg} ${c - seg}`}
            strokeDashoffset={-(i * (seg + gap))}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 + i * 0.06, duration: 0.3 }}
          />
        ))}
      </svg>
      <span className="font-display text-[22px] font-bold leading-none tabular-nums text-lime">
        {days}
      </span>
    </span>
  );
}

/** Sits directly above the button that takes the card: what is free, what is charged, and when. */
export function TrialCallout({
  plan,
  period,
  compact,
  className,
}: {
  plan: PublicPlan;
  period: "month" | "year";
  compact?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const { cents, unit } = priceFor(plan, period);
  const end = trialEndLabel(plan.trialDays);
  return (
    <motion.div
      data-testid="trial-callout"
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? undefined : { opacity: 0, y: -8 }}
      transition={{ duration: 0.5, ease: EASE }}
      className={cn(
        "relative shrink-0 overflow-hidden rounded-[20px] border border-lime/45 bg-lime/[0.07] p-4",
        className,
      )}
    >
      <span
        className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-lime/15 blur-2xl"
        aria-hidden
      />
      <div className="relative flex items-center gap-3.5">
        <DaysRing days={plan.trialDays} />
        <div className="min-w-0">
          <div className="text-[17px] font-bold leading-snug text-fg">
            {plan.trialDays} days free, then{" "}
            <span className="text-lime">
              {fmt(cents)}/{unit}
            </span>
          </div>
          <div className="mt-1 text-[13px] text-muted">
            Card now, charged on {end} unless you cancel.
          </div>
        </div>
      </div>
      {!compact && (
        <ol className="relative mt-4 grid grid-cols-2 gap-2 font-mono text-[11px] uppercase tracking-[0.1em]">
          <li className="rounded-xl border border-lime/30 bg-black/30 px-3 py-2">
            <span className="block text-lime">Today</span>
            <span className="mt-0.5 block font-sans text-[13px] normal-case tracking-normal text-fg">
              $0.00 · full plan unlocked
            </span>
          </li>
          <li className="rounded-xl border border-line bg-black/30 px-3 py-2">
            <span className="block text-muted">{end}</span>
            <span className="mt-0.5 block font-sans text-[13px] normal-case tracking-normal text-fg">
              {fmt(cents)} · then every {unit}
            </span>
          </li>
        </ol>
      )}
    </motion.div>
  );
}

/** The micro-copy under the button. */
export function TrialNote({
  plan,
  className,
}: {
  plan: PublicPlan;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-center text-[13px] leading-relaxed text-muted",
        className,
      )}
    >
      Cancel anytime in Account → Billing before {trialEndLabel(plan.trialDays)}{" "}
      and you won&apos;t be charged.
    </p>
  );
}

export function TrialBadge({ days }: { days: number }) {
  return (
    <span className="ml-2 inline-flex translate-y-[-1px] items-center rounded-full border border-lime/40 bg-lime/10 px-2 py-0.5 align-middle font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-lime">
      {days} days free
    </span>
  );
}
