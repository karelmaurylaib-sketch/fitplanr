"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { fmt, type PublicPlan } from "@/lib/pricing";
import { TrialCallout, TrialNote } from "./trial-callout";

type WhopCheckout = { create: (el: string) => { mount: (sel: string) => void }; destroy?: () => void };
declare global {
  interface Window {
    WhopElements?: () => { checkout: { create: (o: Record<string, unknown>) => WhopCheckout } };
  }
}

let scriptPromise: Promise<void> | null = null;
function loadWhop(): Promise<void> {
  if (window.WhopElements) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdn.whop.com/elements/amber/elements.js";
    s.setAttribute("data-whop-elements", "");
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      scriptPromise = null;
      reject(new Error("whop script"));
    };
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export function CheckoutSheet({
  plan,
  period,
  open,
  onClose,
  onPaid,
  upgrade,
}: {
  plan: PublicPlan | null;
  period: "month" | "year";
  open: boolean;
  onClose: () => void;
  onPaid: (ref: string) => void;
  upgrade?: boolean;
}) {
  const [phase, setPhase] = useState<"loading" | "ready" | "off" | "error">("loading");
  // the server has the last word on the free week (one per account, Starter/Pro only)
  const [serverTrial, setServerTrial] = useState<number | null>(null);
  const ck = useRef<WhopCheckout | null>(null);
  const onPaidRef = useRef(onPaid);
  onPaidRef.current = onPaid;

  useEffect(() => {
    if (!open || !plan) return;
    let dead = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    setPhase("loading");
    setServerTrial(null);

    (async () => {
      try {
        const r = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan: plan.id, period, upgrade: !!upgrade }) });
        const j = await r.json();
        if (dead) return;
        if (r.status === 409 || j.error === "payments_off") return setPhase("off");
        if (!r.ok) return setPhase("error");
        const { embed, ref, fallback_url, trial_days } = j as { embed: string | null; ref: string; fallback_url: string; trial_days?: number };
        setServerTrial(trial_days ?? 0);
        try {
          sessionStorage.setItem("fp_ref", ref);
          if (upgrade) sessionStorage.setItem("fp_upgrade", ref);
        } catch {}
        if (!embed) {
          location.href = fallback_url;
          return;
        }
        await loadWhop();
        if (dead || !window.WhopElements) return;
        let shown = false;
        const show = () => {
          if (!shown && !dead) {
            shown = true;
            setPhase("ready");
          }
        };
        const c = window.WhopElements().checkout.create({
          checkoutConfiguration: embed,
          returnUrl: location.origin + "/dashboard?paid=1&ref=" + ref + (upgrade ? "&upgrade=1" : ""),
          appearance: { theme: { appearance: "dark" } },
          onLoadingChange: (st: unknown) => {
            const loading = st && typeof st === "object" ? (st as { loading?: boolean }).loading : st;
            if (loading === false) show();
          },
          onComplete: (res: { result?: string } | undefined) => {
            if (res && res.result === "payment") onPaidRef.current(ref);
          },
        });
        ck.current = c;
        c.create("checkout").mount("#whop-checkout");
        timers.push(
          setTimeout(() => {
            if (document.querySelector("#whop-checkout iframe")) show();
          }, 2000),
          setTimeout(() => {
            if (!shown && !dead) location.href = fallback_url;
          }, 15000),
        );
      } catch {
        if (!dead) setPhase("error");
      }
    })();

    return () => {
      dead = true;
      timers.forEach(clearTimeout);
      try {
        ck.current?.destroy?.();
      } catch {}
      ck.current = null;
      const el = document.getElementById("whop-checkout");
      if (el) el.innerHTML = "";
    };
  }, [open, plan, period, upgrade]);

  const price = plan ? (period === "year" && plan.yearCents ? `${fmt(plan.yearCents)} / year` : `${fmt(plan.monthCents)} / month`) : "";
  const trialDays = serverTrial ?? plan?.trialDays ?? 0;
  const trialPlan = plan && trialDays > 0 ? { ...plan, trialDays } : null;

  return (
    <Sheet open={open} onClose={onClose} variant="bottom" label="Secure checkout" closeSide="right" z={80} width={520}>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-6 pt-3 sm:px-7 sm:pt-6">
        <div className="pr-12">
          <div className="label">[ Secure checkout ]</div>
          <h2 className="display mt-2 text-[30px]">
            {plan?.name} · <span className="text-lime">{trialPlan ? `${trialDays} days free` : price}</span>
          </h2>
        </div>
        {trialPlan && <TrialCallout plan={trialPlan} period={period} compact className="mt-5" />}
        <div className="relative mt-5 min-h-[420px] flex-1">
          {phase === "loading" && (
            <div className="absolute inset-x-0 top-0 flex items-center gap-2.5 py-6 text-[15px] text-muted">
              <Loader2 size={18} className="animate-spin text-lime" /> Loading secure checkout…
            </div>
          )}
          {phase === "off" && (
            <div className="rounded-2xl border border-line bg-card p-5 text-[15px]">
              <div className="font-semibold">Payments open in a moment. Your plan is saved.</div>
              <p className="mt-1 text-muted">Close this and try again in a few minutes. Nothing is lost.</p>
            </div>
          )}
          {phase === "error" && (
            <div className="rounded-2xl border border-line bg-card p-5 text-[15px]">
              <div className="font-semibold">The checkout didn&apos;t load.</div>
              <p className="mt-1 text-muted">Check your connection, then close this and tap Continue again.</p>
            </div>
          )}
          <div id="whop-checkout" className={phase === "ready" ? "opacity-100 transition-opacity duration-300" : "opacity-0"} />
        </div>
        {trialPlan && <TrialNote plan={trialPlan} className="mt-4" />}
        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[13px] text-muted">
          <Lock size={13} /> Secure payment by Whop · Cancel in 1 click
        </p>
      </div>
    </Sheet>
  );
}
