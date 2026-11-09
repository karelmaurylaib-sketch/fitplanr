"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, CreditCard, Loader2, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { MainButton } from "@/components/ui/button";
import { CheckoutSheet } from "./checkout-sheet";
import { fmt, type PublicPlan } from "@/lib/pricing";
import { TIER_TAGS, UNLOCKS } from "@/lib/tiers";
import { cn } from "@/lib/utils";

const TRIAL_QA = (days: number) => ({
  q: `How does the free ${days === 7 ? "week" : `${days} days`} work?`,
  a: `Pick any plan and use all of it for ${days} days. No card, nothing to cancel. When it ends, you choose: keep your plan or stop. You're never charged without saying yes.`,
});

const QA = [
  { q: "Will it work with my gear?", a: "Yes. Your plan only uses the equipment you picked. If your gear changes, rebuild your plan in one tap and every exercise adapts." },
  { q: "Can I cancel?", a: "Anytime, in 2 taps from Account → Billing. You keep access until the end of the period you paid for." },
  { q: "What happens right after I pay?", a: "Your full plan unlocks right here, no email to check. Day 1 is ready to start, with your rest timer and set logging." },
];

function PlanRows({ plans, period, selected, onSelect, compact, trialDays }: { plans: PublicPlan[]; period: "month" | "year"; selected: number | null; onSelect: (id: number) => void; compact?: boolean; trialDays?: number | null }) {
  return (
    <div className="space-y-3" role="radiogroup" aria-label="Plans">
      {plans.map((p) => {
        const on = selected === p.id;
        const yearly = period === "year" && p.yearCents;
        const popular = p.tier === "pro";
        return (
          <button
            key={p.id}
            role="radio"
            aria-checked={on}
            onClick={() => onSelect(p.id)}
            className={cn(
              "press relative flex w-full items-center gap-3.5 rounded-[20px] border-2 p-4 text-left transition-colors",
              on ? "border-lime bg-lime/[0.06]" : "border-line bg-card hover:border-line-2",
              popular && "mt-3",
            )}
          >
            {popular && <span className="absolute -top-3 left-4 rounded-full bg-lime px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-lime-ink">Most popular</span>}
            <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2", on ? "border-lime" : "border-white/25")}>{on && <span className="h-2.5 w-2.5 rounded-full bg-lime" />}</span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2 text-[17px] font-semibold">
                {p.name}
                {trialDays ? <span className="rounded-full border border-lime/40 px-2 py-px font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-lime">{trialDays} days free</span> : null}
              </span>
              <span className="block text-[13px] text-muted">
                {yearly ? (
                  <>
                    <s className="mr-1 text-dim">{fmt(p.monthCents * 12)}</s>
                    {fmt(p.yearCents!)} / year
                  </>
                ) : (
                  `${fmt(p.monthCents)} / month`
                )}
              </span>
              {!compact && <span className="mt-1 block text-[13px] text-fg/70">{TIER_TAGS[p.tier]}</span>}
            </span>
            <span className="text-right">
              <span className="font-display text-[30px] font-bold leading-none tabular-nums">{yearly ? p.perDayYear : p.perDayMonth}</span>
              <span className="block text-[12px] text-muted">/ day</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function Paywall({
  open,
  onClose,
  plans,
  title,
  line,
  preselect,
  onPaid,
  trialDays,
  onTrial,
}: {
  open: boolean;
  onClose: () => void;
  plans: PublicPlan[];
  title: string;
  line: string;
  preselect?: string | null;
  onPaid: (ref: string) => void;
  /** Days of the free week when this person can still start one; null/undefined once used or when paid. */
  trialDays?: number | null;
  onTrial?: (planName: string) => void;
}) {
  const hasYearly = plans.some((p) => p.yearCents);
  const [period, setPeriod] = useState<"month" | "year">("month");
  const initial = useMemo(() => {
    const want = preselect?.toLowerCase();
    return (want && plans.find((p) => p.name.toLowerCase() === want || p.tier === want)) || plans.find((p) => p.tier === "pro") || plans[0] || null;
  }, [plans, preselect]);
  const [sel, setSel] = useState<number | null>(initial?.id ?? null);
  const [qa, setQa] = useState<number | null>(null);
  const [checkout, setCheckout] = useState(false);
  const [btnVisible, setBtnVisible] = useState(true);
  const [trialBusy, setTrialBusy] = useState(false);
  const [trialErr, setTrialErr] = useState<string | null>(null);
  const trialOn = !!trialDays && !!onTrial;
  const btnRef = useRef<HTMLDivElement>(null);
  const plan = plans.find((p) => p.id === sel) ?? null;

  useEffect(() => {
    if (!open) return;
    fetch("/api/event", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "paywall_view" }) }).catch(() => {});
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const el = btnRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setBtnVisible(e.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, [open, plans.length]);

  const after = plan ? (period === "year" && plan.yearCents ? `${fmt(plan.yearCents)} / year` : `${fmt(plan.monthCents)} / month`) : "";
  const due = plan
    ? trialOn
      ? `$0 today · No card · Then ${after} only if you keep it`
      : period === "year" && plan.yearCents
        ? `${fmt(plan.yearCents)} due today, then every year · Cancel anytime`
        : `${fmt(plan.monthCents)} due today, then every month · Cancel anytime`
    : "";
  const unlocks = plan ? UNLOCKS[plan.tier] : [];
  const faqs = trialOn ? [TRIAL_QA(trialDays!), ...QA] : QA;

  async function startTrial() {
    if (!plan || trialBusy) return;
    setTrialBusy(true);
    setTrialErr(null);
    try {
      const r = await fetch("/api/trial", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan: plan.id }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.ok) return onTrial!(j.plan?.name ?? plan.name);
      setTrialErr(j.error === "trial_used" ? "Your free week was already used. Pick a plan to continue." : "That didn't work. Try again in a moment.");
    } catch {
      setTrialErr("That didn't work. Check your connection and try again.");
    } finally {
      setTrialBusy(false);
    }
  }

  const cta = trialOn ? (
    <MainButton className="w-full" onClick={startTrial} disabled={!plan || trialBusy}>
      {trialBusy && <Loader2 size={18} className="animate-spin" />} Try {plan?.name ?? "it"} free for {trialDays} days
    </MainButton>
  ) : (
    <MainButton className="w-full" onClick={() => plan && setCheckout(true)} disabled={!plan}>
      Continue with {plan?.name ?? "your plan"}
    </MainButton>
  );

  return (
    <>
      <Sheet open={open} onClose={onClose} label="Choose your plan" variant="full" width={480}>
        <div className="relative min-h-0 flex-1 overflow-y-auto px-5 pb-28 pt-16 sm:px-7">
          <h2 className="display text-[38px] sm:text-[42px]">{title}</h2>
          <p className="mt-2 text-[15px] text-muted">{line}</p>

          {plans.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-line bg-card p-5 text-[15px]">
              <div className="font-semibold">Plans are loading.</div>
              <p className="mt-1 text-muted">Your plan is saved. Close this and tap unlock again in a moment.</p>
            </div>
          ) : (
            <>
              <div className="mt-10 flex items-center justify-between">
                <h3 className="text-[18px] font-semibold">Choose your plan.</h3>
                {hasYearly && (
                  <div className="flex rounded-full border border-line bg-card p-1 text-[13px] font-medium">
                    {(["month", "year"] as const).map((p) => (
                      <button key={p} onClick={() => setPeriod(p)} className={cn("press rounded-full px-3 py-1.5", period === p ? "bg-white text-ink" : "text-muted hover:text-fg")}>
                        {p === "month" ? "Monthly" : "Yearly −20%"}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-4">
                <PlanRows plans={plans} period={period} selected={sel} onSelect={setSel} trialDays={trialOn ? trialDays : null} />
              </div>

              <div ref={btnRef} className="mt-6">
                {cta}
                <p className="mt-3 text-center text-[13px] text-muted">{due}</p>
                {trialErr && <p role="alert" className="mt-2 text-center text-[13px] text-danger">{trialErr}</p>}
                {trialOn && (
                  <button onClick={() => plan && setCheckout(true)} disabled={!plan} className="press mx-auto mt-2 block text-[13px] font-medium text-fg/70 underline underline-offset-4 hover:text-fg">
                    Or subscribe now
                  </button>
                )}
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-[12px] text-muted">
                <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-lime" /> Secure payment, processed by Whop</span>
                <span className="rounded-full border border-line px-2 py-0.5 font-semibold text-fg/80">Whop</span>
                <span className="flex items-center gap-1 rounded-full border border-line px-2 py-0.5 font-semibold text-fg/80"><CreditCard size={12} /> Card</span>
              </div>

              <div className="mt-10 rounded-[20px] border border-line bg-card p-5">
                <h3 className="text-[16px] font-semibold">What you unlock with {plan?.name}</h3>
                <ul className="mt-4 space-y-3">
                  {unlocks.map((u) => (
                    <li key={u} className="flex gap-3 text-[15px]">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lime/15 text-lime"><Check size={13} strokeWidth={3} /></span>
                      {u}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 divide-y divide-line rounded-[20px] border border-line">
                {faqs.map((x, i) => (
                  <div key={x.q}>
                    <button onClick={() => setQa(qa === i ? null : i)} aria-expanded={qa === i} className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left text-[15px] font-semibold">
                      {x.q}
                      <ChevronDown size={17} className={cn("shrink-0 text-muted transition-transform", qa === i && "rotate-180")} />
                    </button>
                    <AnimatePresence initial={false}>
                      {qa === i && (
                        <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden px-5 text-[14px] leading-relaxed text-muted">
                          <span className="block pb-4">{x.a}</span>
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              <div className="mt-12">
                <h3 className="display text-[26px]">Pick up where you left off</h3>
                <div className="mt-4">
                  <PlanRows plans={plans} period={period} selected={sel} onSelect={setSel} compact trialDays={trialOn ? trialDays : null} />
                </div>
                <div className="mt-5">{cta}</div>
              </div>

              <p className="mt-8 text-center text-[12px] leading-relaxed text-dim">{trialOn ? "The free week ends on its own: no card, no charge. " : ""}Paid plans renew automatically until canceled. Prices in USD. Not medical advice.</p>
            </>
          )}
        </div>
        <AnimatePresence>
          {!btnVisible && plans.length > 0 && (
            <motion.div initial={{ y: 90, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 90, opacity: 0 }} className="safe-bottom absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0b0c09] via-[#0b0c09] to-transparent px-5 pt-6 sm:px-7">
              {cta}
            </motion.div>
          )}
        </AnimatePresence>
      </Sheet>
      <CheckoutSheet
        open={checkout}
        plan={plan}
        period={period}
        onClose={() => setCheckout(false)}
        onPaid={(ref) => {
          setCheckout(false);
          onPaid(ref);
        }}
      />
    </>
  );
}
