"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Lock } from "lucide-react";
import type { Plan } from "@/lib/engine/generate";
import type { PublicPlan } from "@/lib/pricing";
import { PlanView } from "@/components/plan-view";
import { Paywall } from "@/components/paywall/paywall";
import { UnlockFilm } from "@/components/unlock-film";
import { ShareButton } from "@/components/share-button";
import { Logo } from "@/components/logo";
import { MainButton } from "@/components/ui/button";

export function PlanResult({
  plan,
  locked,
  plans,
  preselect,
  shareId,
  personal,
  trialDays,
  trialOver,
}: {
  plan: Plan;
  locked: boolean;
  plans: PublicPlan[];
  preselect: string | null;
  shareId: string | null;
  personal: string;
  trialDays: number | null;
  trialOver: boolean;
}) {
  const router = useRouter();
  const [paywall, setPaywall] = useState(false);
  const [film, setFilm] = useState<string | null>(null);
  const [unblurring, setUnblurring] = useState(false);
  const cheapest = plans.find((p) => p.tier === "pro") ?? plans[0];

  // open the paywall once, at the peak, the first time they see the result
  useEffect(() => {
    if (!locked) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem("fp_pw_auto") === "1";
      sessionStorage.setItem("fp_pw_auto", "1");
    } catch {}
    if (!seen) {
      const t = setTimeout(() => setPaywall(true), 2600);
      return () => clearTimeout(t);
    }
  }, [locked]);

  const unlock = useCallback(
    async (ref: string) => {
      setPaywall(false);
      try {
        const r = await fetch("/api/checkout/confirm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ref }) });
        const j = await r.json();
        if (j.paid) {
          setFilm(j.plan?.name ?? "your plan");
          router.refresh();
          return;
        }
      } catch {}
      // payment not visible yet: the dashboard keeps checking
      router.push(`/dashboard?paid=1&ref=${encodeURIComponent(ref)}`);
    },
    [router],
  );

  const trialStarted = useCallback(
    (planName: string) => {
      setPaywall(false);
      setFilm(planName);
      router.refresh();
    },
    [router],
  );

  const endFilm = useCallback(() => {
    setFilm(null);
    setUnblurring(true);
    setTimeout(() => setUnblurring(false), 900);
  }, []);

  return (
    <main className="mx-auto max-w-[760px] px-5 pb-36 pt-5">
      <div className="flex items-center justify-between">
        <Link href={locked ? "/plan" : "/dashboard"} aria-label="FitPlanr">
          <Logo size={24} />
        </Link>
        <div className="flex items-center gap-2">
          {shareId && <ShareButton path={`/s/${shareId}`} title={plan.title} />}
          {!locked && (
            <Link href="/dashboard" className="press hidden h-10 items-center rounded-full px-4 text-[14px] text-muted hover:text-fg sm:inline-flex">
              Dashboard
            </Link>
          )}
        </div>
      </div>

      <motion.div className="mt-8" animate={unblurring ? { filter: ["blur(8px)", "blur(0px)"], scale: [0.99, 1] } : {}} transition={{ duration: 0.8 }}>
        <div className="label">[ Your 4-week plan ]</div>
        <h1 className="display mt-3 text-[44px] sm:text-[60px]">{plan.title}</h1>
        <p className="mt-2 text-[16px] text-fg/80">{plan.summary}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-[13px]">
          <span className="rounded-full bg-white/[0.06] px-3 py-1.5">{plan.split}</span>
          <span className="rounded-full bg-white/[0.06] px-3 py-1.5">{plan.weeks[0].days.length} days / week</span>
          <span className="rounded-full bg-white/[0.06] px-3 py-1.5">4 weeks · progressive</span>
        </div>

        {!locked && (
          <div className="mt-6">
            <MainButton href="/workout">Start Day 1</MainButton>
          </div>
        )}

        <div className="mt-8">
          <PlanView plan={plan} locked={locked} onLocked={() => setPaywall(true)} />
        </div>
      </motion.div>

      <AnimatePresence>
        {locked && !paywall && (
          <motion.div initial={{ y: 120 }} animate={{ y: 0 }} exit={{ y: 120 }} transition={{ type: "spring", damping: 28 }} className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-[rgb(8_9_6/0.92)] px-4 pt-3 backdrop-blur-xl">
            <button onClick={() => setPaywall(true)} className="btn-main press mx-auto flex h-[60px] w-full max-w-[600px] items-center justify-between rounded-full bg-lime pl-6 pr-2 font-semibold text-lime-ink">
              <span className="flex items-center gap-2 text-[16px]">
                <Lock size={17} /> Unlock my full plan{trialDays ? ` · ${trialDays} days free` : cheapest ? ` · ${cheapest.perDayMonth} / day` : ""}
              </span>
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-lime-ink text-lime">
                <ArrowRight size={18} className="btn-arrow" />
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {locked && (
        <Paywall
          open={paywall}
          onClose={() => setPaywall(false)}
          plans={plans}
          title={trialOver ? "Your free week is over." : "Your 4-week plan is ready."}
          line={trialOver ? "Keep your plan, your logs and your progress. Pick up right where you left off." : personal}
          preselect={preselect}
          onPaid={unlock}
          trialDays={trialDays}
          onTrial={trialStarted}
        />
      )}
      <UnlockFilm open={!!film} planName={film ?? ""} onDone={endFilm} />
    </main>
  );
}
